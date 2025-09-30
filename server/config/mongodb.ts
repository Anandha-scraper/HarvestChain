import mongoose from 'mongoose';
import { MONGODB_URI as MONGODB_URI_RAW, assertEnvVar } from './env';

// MongoDB connection configuration (Atlas URI required)
let MONGODB_URI = MONGODB_URI_RAW;
assertEnvVar('MONGODB_URI', MONGODB_URI);

// Ensure a default database name of harvestchain if none provided in URI
if (!/\/[A-Za-z0-9_-]+(\?|$)/.test(MONGODB_URI)) {
  if (MONGODB_URI.endsWith('/')) {
    // e.g. mongodb+srv://.../ -> append db directly
    MONGODB_URI = `${MONGODB_URI}harvestchain`;
  } else if (MONGODB_URI.includes('?')) {
    // e.g. mongodb+srv://.../?: ensure single slash before db name
    const [base, query] = MONGODB_URI.split('?');
    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    MONGODB_URI = `${normalizedBase}/harvestchain?${query}`;
  } else {
    MONGODB_URI = `${MONGODB_URI}/harvestchain`;
  }
}

// Connection options
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// Connect to MongoDB
export const connectMongoDB = async (): Promise<void> => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      console.log('📊 Current database:', mongoose.connection.db?.databaseName);
      return;
    }

    console.log('🔍 Connecting to MongoDB...');
    console.log('MONGODB_URI:', MONGODB_URI ? 'Set' : 'Not set');
    console.log('Target database: harvestchain');
    
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log('📊 Connected to database:', mongoose.connection.db?.databaseName);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('MONGODB_URI:', MONGODB_URI);
    console.error('Error details:', error);
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
  console.log('📊 Database name:', mongoose.connection.db?.databaseName);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📡 Mongoose connection closed through app termination');
  process.exit(0);
});

export default mongoose;