import express from 'express';
import { 
  createFarmer, 
  getFarmerByFirebaseUid, 
  getFarmerByPhoneNumber,
  verifyFarmerLogin,
  updateFarmer,
  updateFarmerCrops,
  deleteFarmer,
  getAllFarmers,
  farmerExists,
  getFarmerStats,
  FarmerData
} from '../services/farmerService';

const router = express.Router();

// Create a new farmer
router.post('/create', async (req, res) => {
  try {
    console.log('📥 Received farmer creation request:', req.body);
    const farmerData: FarmerData = req.body;
    
    // Validate required fields
    if (!farmerData.firebaseUid || !farmerData.name || !farmerData.phoneNumber || 
        !farmerData.aadharNumber || !farmerData.location) {
      console.log('❌ Missing required fields:', {
        firebaseUid: !!farmerData.firebaseUid,
        name: !!farmerData.name,
        phoneNumber: !!farmerData.phoneNumber,
        aadharNumber: !!farmerData.aadharNumber,
        location: !!farmerData.location
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firebaseUid, name, phoneNumber, aadharNumber, location'
      });
    }

    console.log('✅ All required fields present, creating farmer...');
    const farmer = await createFarmer(farmerData);
    
    console.log('✅ Farmer created successfully, sending response...');
    res.status(201).json({
      success: true,
      message: 'Farmer created successfully',
      data: farmer
    });
  } catch (error: any) {
    console.error('❌ Error in create farmer route:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create farmer'
    });
  }
});

// Get farmer by Firebase UID
router.get('/firebase/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const farmer = await getFarmerByFirebaseUid(uid);
    
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
    console.error('Error in get farmer by Firebase UID route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get farmer'
    });
  }
});

// Get farmer by phone number
router.get('/phone/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const farmer = await getFarmerByPhoneNumber(phoneNumber);
    
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
    console.error('Error in get farmer by phone route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get farmer'
    });
  }
});

// Login farmer with phone number and passcode
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, passcode } = req.body;
    
    // Validate required fields
    if (!phoneNumber || !passcode) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and passcode are required'
      });
    }

    const farmer = await verifyFarmerLogin(phoneNumber, passcode);
    
    if (!farmer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or passcode'
      });
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      data: farmer
    });
  } catch (error: any) {
    console.error('Error in farmer login route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to login farmer'
    });
  }
});

// Update farmer
router.put('/update/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = req.body;
    
    const farmer = await updateFarmer(uid, updateData);
    
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

// Update farmer crops
router.put('/crops/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { crops } = req.body;
    
    if (!crops || !Array.isArray(crops)) {
      return res.status(400).json({
        success: false,
        message: 'Crops array is required'
      });
    }
    
    const farmer = await updateFarmerCrops(farmerId, crops);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Farmer crops updated successfully',
      data: farmer
    });
  } catch (error: any) {
    console.error('Error in update farmer crops route:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update farmer crops'
    });
  }
});

// Delete farmer
router.delete('/delete/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const deleted = await deleteFarmer(uid);
    
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

// Get all farmers (with pagination)
router.get('/all', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;
    
    const farmers = await getAllFarmers(limit, skip);
    
    res.json({
      success: true,
      data: farmers,
      pagination: {
        limit,
        skip,
        count: farmers.length
      }
    });
  } catch (error: any) {
    console.error('Error in get all farmers route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get farmers'
    });
  }
});

// Check if farmer exists
router.get('/exists/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const exists = await farmerExists(uid);
    
    res.json({
      success: true,
      exists
    });
  } catch (error: any) {
    console.error('Error in check farmer exists route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check farmer existence'
    });
  }
});

// Get farmer statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await getFarmerStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Error in get farmer stats route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get farmer statistics'
    });
  }
});

export default router;