import express, { type Request, Response, NextFunction } from "express";
import mongoose from 'mongoose';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/harvestchain';

// Connection options
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Initialize MongoDB connection
let mongoConnected = false;

const connectMongoDB = async (): Promise<void> => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      mongoConnected = true;
      return;
    }

    console.log('🔍 Connecting to MongoDB...');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(MONGODB_URI, options);
    mongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('MONGODB_URI:', MONGODB_URI);
    mongoConnected = false;
    throw error;
  }
};

// Initialize MongoDB on startup
connectMongoDB().catch(error => {
  console.error('Failed to initialize MongoDB:', error);
});

// Middleware to check MongoDB connection
app.use('/api', async (req, res, next) => {
  // Skip MongoDB check for health and test endpoints
  if (req.path === '/api/health' || req.path === '/api/test') {
    return next();
  }
  
  if (!mongoConnected) {
    try {
      console.log('🔄 Retrying MongoDB connection...');
      await connectMongoDB();
    } catch (error) {
      console.error('❌ MongoDB retry failed:', error);
      return res.status(503).json({
        success: false,
        message: 'Database connection not available. Please check environment variables.',
        error: 'MongoDB not connected',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Make sure MONGODB_URI is set in Vercel environment variables'
      });
    }
  }
  next();
});

// Register routes
app.use('/api/farmers', async (req, res, next) => {
  try {
    const farmerRoutes = (await import('../server/routes/farmerRoutes')).default;
    farmerRoutes(req, res, next);
  } catch (error) {
    console.error('Error loading farmer routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load farmer routes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.use('/api/admin', async (req, res, next) => {
  try {
    const adminRoutes = (await import('../server/routes/adminRoutes')).default;
    adminRoutes(req, res, next);
  } catch (error) {
    console.error('Error loading admin routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load admin routes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Test endpoint to check MongoDB connection
app.get('/api/test', async (req, res) => {
  try {
    console.log('🧪 Testing MongoDB connection...');
    await connectMongoDB();
    
    // Test a simple query
    const collections = await mongoose.connection.db?.listCollections().toArray();
    
    res.json({ 
      status: 'OK', 
      message: 'MongoDB connection successful',
      mongoConnected,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      readyState: mongoose.connection.readyState,
      collections: collections?.length || 0
    });
  } catch (error: any) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'MongoDB connection failed',
      mongoConnected,
      error: error.message,
      stack: error.stack,
      environment: process.env.NODE_ENV,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      readyState: error.readyState || 'unknown'
    });
  }
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ 
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

export default app;