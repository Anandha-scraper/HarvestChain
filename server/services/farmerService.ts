import Farmer, { IFarmer } from '../models/Farmer';

// Farmer data interface for API
export interface FarmerData {
  firebaseUid: string;
  name: string;
  phoneNumber: string;
  passcode: string;
  aadharNumber: string;
  location: string;
  cropsGrown: string[];
}

// Create a new farmer
export const createFarmer = async (farmerData: FarmerData): Promise<IFarmer> => {
  try {
    console.log('🔍 Creating farmer with data:', farmerData);
    
    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({
      $or: [
        { firebaseUid: farmerData.firebaseUid },
        { phoneNumber: farmerData.phoneNumber },
        { aadharNumber: farmerData.aadharNumber }
      ]
    });

    if (existingFarmer) {
      console.log('❌ Farmer already exists:', existingFarmer);
      throw new Error('Farmer already exists with this phone number, Aadhar, or Firebase UID');
    }

    console.log('✅ No existing farmer found, creating new one...');
    const farmer = new Farmer(farmerData);
    const savedFarmer = await farmer.save();
    console.log('✅ Farmer saved successfully:', savedFarmer._id);
    return savedFarmer;
  } catch (error: any) {
    console.error('❌ Error creating farmer:', error);
    throw new Error(error.message || 'Failed to create farmer');
  }
};

// Get farmer by Firebase UID
export const getFarmerByFirebaseUid = async (firebaseUid: string): Promise<IFarmer | null> => {
  try {
    const farmer = await Farmer.findOne({ firebaseUid });
    return farmer;
  } catch (error: any) {
    console.error('Error getting farmer by Firebase UID:', error);
    throw new Error(error.message || 'Failed to get farmer');
  }
};

// Get farmer by phone number
export const getFarmerByPhoneNumber = async (phoneNumber: string): Promise<IFarmer | null> => {
  try {
    const farmer = await Farmer.findOne({ phoneNumber });
    return farmer;
  } catch (error: any) {
    console.error('Error getting farmer by phone number:', error);
    throw new Error(error.message || 'Failed to get farmer');
  }
};

// Verify farmer login with phone number and passcode
export const verifyFarmerLogin = async (phoneNumber: string, passcode: string): Promise<IFarmer | null> => {
  try {
    const farmer = await Farmer.findOne({ 
      phoneNumber: phoneNumber,
      passcode: passcode 
    });
    return farmer;
  } catch (error: any) {
    console.error('Error verifying farmer login:', error);
    throw new Error(error.message || 'Failed to verify farmer login');
  }
};

// Update farmer data
export const updateFarmer = async (firebaseUid: string, updateData: Partial<FarmerData>): Promise<IFarmer | null> => {
  try {
    const farmer = await Farmer.findOneAndUpdate(
      { firebaseUid },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    return farmer;
  } catch (error: any) {
    console.error('Error updating farmer:', error);
    throw new Error(error.message || 'Failed to update farmer');
  }
};

// Update farmer crops specifically
export const updateFarmerCrops = async (farmerId: string, crops: string[]): Promise<IFarmer | null> => {
  try {
    console.log('🔍 Updating farmer crops:', { farmerId, crops });
    
    const farmer = await Farmer.findByIdAndUpdate(
      farmerId,
      { 
        cropsGrown: crops, 
        updatedAt: new Date() 
      },
      { new: true, runValidators: true }
    );
    
    if (!farmer) {
      throw new Error('Farmer not found');
    }
    
    console.log('✅ Farmer crops updated successfully:', farmer._id);
    return farmer;
  } catch (error: any) {
    console.error('❌ Error updating farmer crops:', error);
    throw new Error(error.message || 'Failed to update farmer crops');
  }
};

// Delete farmer
export const deleteFarmer = async (firebaseUid: string): Promise<boolean> => {
  try {
    const result = await Farmer.findOneAndDelete({ firebaseUid });
    return result !== null;
  } catch (error: any) {
    console.error('Error deleting farmer:', error);
    throw new Error(error.message || 'Failed to delete farmer');
  }
};

// Get all farmers (for admin purposes)
export const getAllFarmers = async (limit: number = 50, skip: number = 0): Promise<IFarmer[]> => {
  try {
    const farmers = await Farmer.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    return farmers;
  } catch (error: any) {
    console.error('Error getting all farmers:', error);
    throw new Error(error.message || 'Failed to get farmers');
  }
};

// Check if farmer exists
export const farmerExists = async (firebaseUid: string): Promise<boolean> => {
  try {
    const farmer = await Farmer.findOne({ firebaseUid });
    return farmer !== null;
  } catch (error: any) {
    console.error('Error checking if farmer exists:', error);
    return false;
  }
};

// Get farmer statistics
export const getFarmerStats = async (): Promise<{
  totalFarmers: number;
  farmersByCrop: { [key: string]: number };
  farmersByLocation: { [key: string]: number };
}> => {
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
    
    return {
      totalFarmers,
      farmersByCrop,
      farmersByLocation
    };
  } catch (error: any) {
    console.error('Error getting farmer stats:', error);
    throw new Error(error.message || 'Failed to get farmer statistics');
  }
};