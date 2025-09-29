import express, { type Request, Response, NextFunction } from "express";
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

// Farmer Schema
const farmerSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, unique: true },
  passcode: { type: String, required: true, minlength: 4, maxlength: 4 },
  aadharNumber: { type: String, required: true, unique: true },
  location: { type: String, required: true, trim: true },
  cropsGrown: [{ type: String, trim: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false });

const Farmer = mongoose.model('Farmer', farmerSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false });

const Admin = mongoose.model('Admin', adminSchema);

// Farmer routes
app.post('/api/farmers/login', async (req, res) => {
  try {
    const { phoneNumber, passcode } = req.body;
    
    if (!phoneNumber || !passcode) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and passcode are required'
      });
    }

    const farmer = await Farmer.findOne({ 
      phoneNumber: phoneNumber,
      passcode: passcode 
    });
    
    if (!farmer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or passcode'
      });
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: farmer._id.toString(),
        _id: farmer._id.toString(),
        name: farmer.name,
        phoneNumber: farmer.phoneNumber,
        aadharNumber: farmer.aadharNumber,
        location: farmer.location,
        cropsGrown: farmer.cropsGrown
      }
    });
  } catch (error: any) {
    console.error('Error in farmer login:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to login farmer'
    });
  }
});

app.post('/api/farmers/create', async (req, res) => {
  try {
    const farmerData = req.body;
    
    // Validate required fields
    if (!farmerData.firebaseUid || !farmerData.name || !farmerData.phoneNumber || 
        !farmerData.aadharNumber || !farmerData.location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firebaseUid, name, phoneNumber, aadharNumber, location'
      });
    }

    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({
      $or: [
        { firebaseUid: farmerData.firebaseUid },
        { phoneNumber: farmerData.phoneNumber },
        { aadharNumber: farmerData.aadharNumber }
      ]
    });

    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        message: 'Farmer already exists with this phone number, Aadhar, or Firebase UID'
      });
    }

    const farmer = new Farmer(farmerData);
    const savedFarmer = await farmer.save();
    
    res.status(201).json({
      success: true,
      message: 'Farmer created successfully',
      data: savedFarmer
    });
  } catch (error: any) {
    console.error('Error creating farmer:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create farmer'
    });
  }
});

app.put('/api/farmers/crops/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { crops } = req.body;
    
    console.log('🔍 Updating farmer crops:', { farmerId, crops });
    
    if (!farmerId || farmerId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Farmer ID is required and cannot be undefined'
      });
    }
    
    if (!crops || !Array.isArray(crops)) {
      return res.status(400).json({
        success: false,
        message: 'Crops array is required'
      });
    }
    
    const farmer = await Farmer.findByIdAndUpdate(
      farmerId,
      { 
        cropsGrown: crops, 
        updatedAt: new Date() 
      },
      { new: true, runValidators: true }
    );
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }
    
    console.log('✅ Farmer crops updated successfully:', farmer._id);
    res.json({
      success: true,
      message: 'Farmer crops updated successfully',
      data: farmer
    });
  } catch (error: any) {
    console.error('❌ Error updating farmer crops:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update farmer crops',
      details: error.message
    });
  }
});

// Admin routes
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check if admin exists in database
    const admin = await Admin.findOne({ 
      username: username,
      isActive: true 
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: admin._id.toString(),
        username: admin.username,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error: any) {
    console.error('Error in admin login:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to login admin'
    });
  }
});

// Get all farmers for admin
app.get('/api/admin/farmers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;
    
    const farmers = await Farmer.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Farmer.countDocuments();
    
    res.json({
      success: true,
      data: farmers,
      pagination: {
        limit,
        skip,
        total,
        count: farmers.length
      }
    });
  } catch (error: any) {
    console.error('Error getting farmers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get farmers'
    });
  }
});

// Get admin statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalFarmers = await Farmer.countDocuments();
    
    const farmers = await Farmer.find({}, 'cropsGrown location');
    
    const farmersByCrop: { [key: string]: number } = {};
    const farmersByLocation: { [key: string]: number } = {};
    
    farmers.forEach(farmer => {
      // Count crops
      farmer.cropsGrown.forEach(crop => {
        farmersByCrop[crop] = (farmersByCrop[crop] || 0) + 1;
      });
      
      // Count locations
      farmersByLocation[farmer.location] = (farmersByLocation[farmer.location] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        totalFarmers,
        farmersByCrop,
        farmersByLocation
      }
    });
  } catch (error: any) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get admin statistics'
    });
  }
});

// Get farmer by ID for admin
app.get('/api/admin/farmers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const farmer = await Farmer.findById(id);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }
    
    res.json({
      success: true,
      data: farmer
    });
  } catch (error: any) {
    console.error('Error getting farmer by ID:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get farmer'
    });
  }
});

// Update farmer by ID for admin
app.put('/api/admin/farmers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated
    delete updateData.passcode;
    delete updateData.firebaseUid;
    delete updateData._id;
    delete updateData.createdAt;
    
    const farmer = await Farmer.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Farmer updated successfully',
      data: farmer
    });
  } catch (error: any) {
    console.error('Error updating farmer:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update farmer'
    });
  }
});

// Delete farmer by ID for admin
app.delete('/api/admin/farmers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Farmer.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Farmer deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting farmer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete farmer'
    });
  }
});

// Update admin credentials
app.put('/api/admin/credentials', async (req, res) => {
  try {
    const { adminId, username, currentPassword, newPassword } = req.body;
    
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    if (!username && !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username or new password is required'
      });
    }

    // Find the admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password'
        });
      }
      
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    // Prepare update data
    const updateFields: any = {};
    if (username) {
      // Check if username is already taken by another admin
      const existingAdmin = await Admin.findOne({ 
        username: username, 
        _id: { $ne: adminId } 
      });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
      updateFields.username = username;
    }
    if (newPassword) {
      // Hash new password
      updateFields.password = await bcrypt.hash(newPassword, 10);
    }

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Credentials updated successfully',
      data: {
        id: updatedAdmin._id.toString(),
        username: updatedAdmin.username,
        role: updatedAdmin.role
      }
    });
  } catch (error: any) {
    console.error('Error in update admin credentials route:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update admin credentials'
    });
  }
});

// Initialize default admin (call this once during setup)
app.post('/api/admin/init', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin already exists',
        data: { username: existingAdmin.username, role: existingAdmin.role }
      });
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await admin.save();

    res.json({
      success: true,
      message: 'Default admin created successfully',
      data: { username: admin.username, role: admin.role }
    });
  } catch (error: any) {
    console.error('Error creating default admin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create default admin'
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