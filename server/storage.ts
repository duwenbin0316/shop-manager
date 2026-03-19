import { type Product, type InsertProduct } from "@shared/schema";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getCategories(): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private nextId: number;

  constructor() {
    this.products = new Map();
    this.nextId = 1;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort((a, b) => b.id - a.id);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.nextId++;
    const product: Product = { ...insertProduct, id, imageUrl: insertProduct.imageUrl ?? null, note: insertProduct.note ?? null };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, insertProduct: InsertProduct): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated: Product = { ...insertProduct, id, imageUrl: insertProduct.imageUrl ?? null, note: insertProduct.note ?? null };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getCategories(): Promise<string[]> {
    const cats = new Set<string>();
    for (const p of this.products.values()) {
      cats.add(p.category);
    }
    return Array.from(cats).sort();
  }
}

export const storage = new MemStorage();
