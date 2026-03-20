import { type Product, type InsertProduct, products } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";

function getPoolConfig(): pg.PoolConfig {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
    };
  }

  // Allow direct PG* env vars in environments that don't expose DATABASE_URL.
  const hasDiscretePgConfig = Boolean(
    process.env.PGHOST ||
    process.env.PGHOSTADDR ||
    process.env.PGPORT ||
    process.env.PGUSER ||
    process.env.PGDATABASE,
  );

  if (hasDiscretePgConfig) {
    return {};
  }

  throw new Error(
    "Database configuration is missing. Set DATABASE_URL or provide PGHOST/PGPORT/PGUSER/PGDATABASE environment variables.",
  );
}

let pool: pg.Pool | null = null;
let db: NodePgDatabase<Record<string, never>> | null = null;

function getPool() {
  if (!pool) {
    pool = new pg.Pool(getPoolConfig());
  }
  return pool;
}

function getDb() {
  if (!db) {
    db = drizzle(getPool());
  }
  return db;
}

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getCategories(): Promise<string[]>;
  initDB(): Promise<void>;
}

export class PgStorage implements IStorage {
  async initDB() {
    // Create table if not exists
    await getPool().query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        image_data TEXT,
        note TEXT
      )
    `);
  }

  async getProducts(): Promise<Product[]> {
    return getDb().select().from(products).orderBy(desc(products.id));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const rows = await getDb().select().from(products).where(eq(products.id, id));
    return rows[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const rows = await getDb().insert(products).values({
      name: product.name,
      price: product.price,
      category: product.category,
      imageData: product.imageData ?? null,
      note: product.note ?? null,
    }).returning();
    return rows[0];
  }

  async updateProduct(id: number, product: InsertProduct): Promise<Product | undefined> {
    const rows = await getDb().update(products)
      .set({
        name: product.name,
        price: product.price,
        category: product.category,
        imageData: product.imageData ?? null,
        note: product.note ?? null,
      })
      .where(eq(products.id, id))
      .returning();
    return rows[0];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await getDb().delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async getCategories(): Promise<string[]> {
    const rows = await getDb().selectDistinct({ category: products.category }).from(products).orderBy(products.category);
    return rows.map(r => r.category);
  }
}

export const storage = new PgStorage();
