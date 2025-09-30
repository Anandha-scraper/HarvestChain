import mongoose from 'mongoose';
import Admin from '../models/Admin';
import Farmer from '../models/Farmer';

export interface InitializeDatabaseOptions {
  createMaster?: boolean;
}

export const initializeDatabase = async (options: InitializeDatabaseOptions = {}) => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection is not established');
  }

  const createdCollections: string[] = [];
  const ensuredIndexes: string[] = [];

  // Ensure collections exist (Mongo creates DB on first collection creation)
  const desiredCollections = ['admin', 'farmers'];
  const existingCollections = await db.listCollections().toArray();
  const existingNames = new Set(existingCollections.map((c) => c.name));

  for (const name of desiredCollections) {
    if (!existingNames.has(name)) {
      await db.createCollection(name);
      createdCollections.push(name);
    }
  }

  // Ensure indexes via Mongoose models
  await Admin.init();
  ensuredIndexes.push('admin');
  await Farmer.init();
  ensuredIndexes.push('farmers');

  let masterInitialized: boolean | undefined;
  if (options.createMaster) {
    const count = await mongoose.connection.model('Admin').countDocuments({ role: 'master' });
    masterInitialized = count > 0;
  }

  return {
    database: db.databaseName,
    createdCollections,
    ensuredIndexes,
    masterInitialized,
  };
};


