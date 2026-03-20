import { pgTable, text, real, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  category: text("category").notNull(),
  imageData: text("image_data"), // base64 encoded image
  note: text("note"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
}).extend({
  name: z.string().min(1, "商品名称不能为空"),
  price: z.number().min(0, "价格不能为负数"),
  category: z.string().min(1, "请选择分类"),
  imageData: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
