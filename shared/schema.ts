import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Farmer data schema
export const farmers = pgTable("farmers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  passcode: text("passcode").notNull(),
  name: text("name").notNull(),
  aadharNumber: text("aadhar_number").notNull(),
  place: text("place").notNull(),
  cropsGrown: text("crops_grown").array().notNull(),
});

// Crop batches schema
export const cropBatches = pgTable("crop_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").notNull(),
  cropType: text("crop_type").notNull(),
  giTag: text("gi_tag"),
  quantity: text("quantity").notNull(), // e.g., "5/kg" or "single"
  qrCodes: json("qr_codes").$type<string[]>().default([]),
  ipfsHash: text("ipfs_hash"),
  status: text("status").notNull().default("generated"), // generated, uploaded, in_transit, with_retailer, sold
  createdAt: timestamp("created_at").defaultNow(),
});

// QR scan tracking schema
export const qrScans = pgTable("qr_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  qrCode: text("qr_code").notNull(),
  batchId: varchar("batch_id").notNull(),
  scannedBy: text("scanned_by").notNull(), // "retailer" or "consumer"
  currentPrice: text("current_price"),
  location: text("location"),
  status: text("status").notNull(),
  scannedAt: timestamp("scanned_at").defaultNow(),
});

// Insert schemas
export const insertFarmerSchema = createInsertSchema(farmers).omit({ id: true });
export const insertCropBatchSchema = createInsertSchema(cropBatches).omit({ id: true, createdAt: true });
export const insertQrScanSchema = createInsertSchema(qrScans).omit({ id: true, scannedAt: true });

// Types
export type Farmer = typeof farmers.$inferSelect;
export type CropBatch = typeof cropBatches.$inferSelect;
export type QrScan = typeof qrScans.$inferSelect;
export type InsertFarmer = z.infer<typeof insertFarmerSchema>;
export type InsertCropBatch = z.infer<typeof insertCropBatchSchema>;
export type InsertQrScan = z.infer<typeof insertQrScanSchema>;
