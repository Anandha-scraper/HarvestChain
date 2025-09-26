import { type Farmer, type CropBatch, type QrScan, type InsertFarmer, type InsertCropBatch, type InsertQrScan } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for crop tracking application
export interface IStorage {
  // Farmer operations
  getFarmer(id: string): Promise<Farmer | undefined>;
  getFarmerByPhone(phoneNumber: string): Promise<Farmer | undefined>;
  createFarmer(farmer: InsertFarmer): Promise<Farmer>;
  authenticateFarmer(phoneNumber: string, passcode: string): Promise<Farmer | undefined>;
  
  // Crop batch operations
  getCropBatch(id: string): Promise<CropBatch | undefined>;
  getCropBatchesByFarmer(farmerId: string): Promise<CropBatch[]>;
  createCropBatch(batch: InsertCropBatch): Promise<CropBatch>;
  updateCropBatch(id: string, updates: Partial<CropBatch>): Promise<CropBatch | undefined>;
  
  // QR scan operations
  getQrScan(id: string): Promise<QrScan | undefined>;
  getQrScansByBatch(batchId: string): Promise<QrScan[]>;
  createQrScan(scan: InsertQrScan): Promise<QrScan>;
  getCropBatchByQrCode(qrCode: string): Promise<CropBatch | undefined>;
}

export class MemStorage implements IStorage {
  private farmers: Map<string, Farmer>;
  private cropBatches: Map<string, CropBatch>;
  private qrScans: Map<string, QrScan>;

  constructor() {
    this.farmers = new Map();
    this.cropBatches = new Map();
    this.qrScans = new Map();
    
    // Add mock farmers for demo
    this.seedMockData();
  }

  private seedMockData() {
    // Create sample farmers
    const farmer1: Farmer = {
      id: "farmer-1",
      phoneNumber: "9876543210",
      passcode: "1234",
      name: "Ravi Kumar",
      aadharNumber: "1234-5678-9012",
      place: "Mysore, Karnataka",
      cropsGrown: ["Rice", "Wheat", "Sugarcane"]
    };
    
    const farmer2: Farmer = {
      id: "farmer-2",
      phoneNumber: "9876543211",
      passcode: "5678",
      name: "Priya Sharma",
      aadharNumber: "2345-6789-0123",
      place: "Coimbatore, Tamil Nadu",
      cropsGrown: ["Cotton", "Coconut", "Banana"]
    };
    
    this.farmers.set(farmer1.id, farmer1);
    this.farmers.set(farmer2.id, farmer2);
  }

  // Farmer operations
  async getFarmer(id: string): Promise<Farmer | undefined> {
    return this.farmers.get(id);
  }

  async getFarmerByPhone(phoneNumber: string): Promise<Farmer | undefined> {
    return Array.from(this.farmers.values()).find(
      (farmer) => farmer.phoneNumber === phoneNumber
    );
  }

  async createFarmer(insertFarmer: InsertFarmer): Promise<Farmer> {
    const id = randomUUID();
    const farmer: Farmer = { ...insertFarmer, id };
    this.farmers.set(id, farmer);
    return farmer;
  }

  async authenticateFarmer(phoneNumber: string, passcode: string): Promise<Farmer | undefined> {
    const farmer = await this.getFarmerByPhone(phoneNumber);
    if (farmer && farmer.passcode === passcode) {
      return farmer;
    }
    return undefined;
  }

  // Crop batch operations
  async getCropBatch(id: string): Promise<CropBatch | undefined> {
    return this.cropBatches.get(id);
  }

  async getCropBatchesByFarmer(farmerId: string): Promise<CropBatch[]> {
    return Array.from(this.cropBatches.values()).filter(
      (batch) => batch.farmerId === farmerId
    );
  }

  async createCropBatch(insertBatch: InsertCropBatch): Promise<CropBatch> {
    const id = randomUUID();
    const batch: CropBatch = { 
      ...insertBatch, 
      id, 
      createdAt: new Date()
    };
    this.cropBatches.set(id, batch);
    return batch;
  }

  async updateCropBatch(id: string, updates: Partial<CropBatch>): Promise<CropBatch | undefined> {
    const existing = this.cropBatches.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.cropBatches.set(id, updated);
    return updated;
  }

  // QR scan operations
  async getQrScan(id: string): Promise<QrScan | undefined> {
    return this.qrScans.get(id);
  }

  async getQrScansByBatch(batchId: string): Promise<QrScan[]> {
    return Array.from(this.qrScans.values()).filter(
      (scan) => scan.batchId === batchId
    );
  }

  async createQrScan(insertScan: InsertQrScan): Promise<QrScan> {
    const id = randomUUID();
    const scan: QrScan = { 
      ...insertScan, 
      id, 
      scannedAt: new Date()
    };
    this.qrScans.set(id, scan);
    return scan;
  }

  async getCropBatchByQrCode(qrCode: string): Promise<CropBatch | undefined> {
    for (const batch of this.cropBatches.values()) {
      if (batch.qrCodes && batch.qrCodes.includes(qrCode)) {
        return batch;
      }
    }
    return undefined;
  }
}

export const storage = new MemStorage();
