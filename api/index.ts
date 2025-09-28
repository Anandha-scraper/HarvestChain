import express, { type Request, Response, NextFunction } from "express";

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

// Initialize MongoDB connection
let mongoConnected = false;
const initializeMongoDB = async () => {
  try {
    const { connectMongoDB } = await import('../server/config/mongodb');
    await connectMongoDB();
    mongoConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    mongoConnected = false;
  }
};

// Initialize MongoDB on startup
initializeMongoDB();

// Middleware to check MongoDB connection
app.use('/api', (req, res, next) => {
  if (!mongoConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available. Please try again later.',
      error: 'MongoDB not connected'
    });
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
    const { connectMongoDB } = await import('../server/config/mongodb');
    await connectMongoDB();
    res.json({ 
      status: 'OK', 
      message: 'MongoDB connection successful',
      mongoConnected,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'MongoDB connection failed',
      mongoConnected,
      error: error.message,
      stack: error.stack,
      environment: process.env.NODE_ENV,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
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