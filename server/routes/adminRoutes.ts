import express from 'express';
import { 
  verifyAdminLogin,
  getAllFarmersForAdmin,
  deleteFarmerById,
  getFarmerById,
  updateFarmerById,
  getAdminStats,
  createMasterAdmin,
  createMasterAdminWithCredentials,
  updateAdminCredentials
} from '../services/adminService';
import { SETUP_SECRET } from '../config/env';
import { initializeDatabase } from '../services/initService';
import { authMiddleware, signAuthToken } from '../middleware/auth';

const router = express.Router();

// Initialize master admin (call this once during setup)
router.post('/init-master', async (req, res) => {
  try {
    const masterAdmin = await createMasterAdmin();
    res.json({
      success: true,
      message: 'Master admin initialized successfully',
      data: { username: masterAdmin?.username, role: masterAdmin?.role }
    });
  } catch (error: any) {
    console.error('Error initializing master admin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize master admin'
    });
  }
});

// One-time secure setup: create master admin with provided credentials
router.post('/init-master/custom', async (req, res) => {
  try {
    const { setupSecret, username, password } = req.body;
    if (!setupSecret || setupSecret !== SETUP_SECRET) {
      return res.status(401).json({ success: false, message: 'Unauthorized setup' });
    }
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    const admin = await createMasterAdminWithCredentials(username, password);
    res.json({ success: true, message: 'Master admin created', data: { id: admin._id, username: admin.username } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create master admin' });
  }
});

// Initialize database and ensure collections exist
router.post('/init-db', async (req, res) => {
  try {
    const createMaster = Boolean(req.body?.createMaster);
    const result = await initializeDatabase({ createMaster });
    res.json({
      success: true,
      message: 'Database initialized',
      data: result
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize database'
    });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const admin = await verifyAdminLogin({ username, password });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    const token = signAuthToken({ id: String(admin._id), role: admin.role });
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        lastLogin: admin.lastLogin,
        token
      }
    });
  } catch (error: any) {
    console.error('Error in admin login route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to login admin'
    });
  }
});

// Protect routes below this line
router.use(authMiddleware);

// Get all farmers (with pagination)
router.get('/farmers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;
    
    const result = await getAllFarmersForAdmin(limit, skip);
    
    res.json({
      success: true,
      data: result.farmers,
      pagination: result.pagination
    });
  } catch (error: any) {
    console.error('Error in get all farmers route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get farmers'
    });
  }
});

// Get farmer by ID
router.get('/farmers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const farmer = await getFarmerById(id);
    
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
    console.error('Error in get farmer by ID route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get farmer'
    });
  }
});

// Update farmer by ID
router.put('/farmers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated
    delete updateData.passcode;
    delete updateData.firebaseUid;
    delete updateData._id;
    delete updateData.createdAt;
    
    const farmer = await updateFarmerById(id, updateData);
    
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
    console.error('Error in update farmer route:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update farmer'
    });
  }
});

// Delete farmer by ID
router.delete('/farmers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteFarmerById(id);
    
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
    console.error('Error in delete farmer route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete farmer'
    });
  }
});

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await getAdminStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Error in get admin stats route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get admin statistics'
    });
  }
});

// Update admin credentials
router.put('/credentials', async (req, res) => {
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

    const updatedAdmin = await updateAdminCredentials(adminId, {
      username,
      currentPassword,
      newPassword
    });
    
    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Credentials updated successfully',
      data: {
        id: updatedAdmin._id,
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

export default router;