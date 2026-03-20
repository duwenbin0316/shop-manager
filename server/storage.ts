import { type Product, type InsertProduct, products } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc, sql } from "drizzle-orm";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

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
    await pool.query(`
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
    return db.select().from(products).orderBy(desc(products.id));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const rows = await db.select().from(products).where(eq(products.id, id));
    return rows[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const rows = await db.insert(products).values({
      name: product.name,
      price: product.price,
      category: product.category,
      imageData: product.imageData ?? null,
      note: product.note ?? null,
    }).returning();
    return rows[0];
  }

  async updateProduct(id: number, product: InsertProduct): Promise<Product | undefined> {
    const rows = await db.update(products)
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
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async getCategories(): Promise<string[]> {
    const rows = await db.selectDistinct({ category: products.category }).from(products).orderBy(products.category);
    return rows.map(r => r.category);
  }
}

export const storage = new PgStorage();
