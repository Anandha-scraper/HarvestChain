import Admin, { IAdmin } from '../models/Admin';
import Farmer from '../models/Farmer';
import bcrypt from 'bcryptjs';

// Admin data interface
export interface AdminData {
  username: string;
  password: string;
  role?: 'master' | 'admin';
}

// Login credentials interface
export interface LoginCredentials {
  username: string;
  password: string;
}

// Create master admin (only for initial setup)
export const createMasterAdmin = async (): Promise<IAdmin | null> => {
  try {
    // Check if master admin already exists
    const existingMaster = await Admin.findOne({ role: 'master' });
    if (existingMaster) {
      console.log('Master admin already exists');
      return existingMaster;
    }

    // Create master admin with hardcoded credentials
    const masterAdmin = new Admin({
      username: 'master',
      password: await bcrypt.hash('admin123', 10), // Default password
      role: 'master',
      isActive: true
    });

    const savedAdmin = await masterAdmin.save();
    console.log('✅ Master admin created successfully');
    return savedAdmin;
  } catch (error: any) {
    console.error('Error creating master admin:', error);
    throw new Error(error.message || 'Failed to create master admin');
  }
};

// Verify admin login
export const verifyAdminLogin = async (credentials: LoginCredentials): Promise<IAdmin | null> => {
  try {
    const admin = await Admin.findOne({ 
      username: credentials.username,
      isActive: true 
    });

    if (!admin) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);
    if (!isPasswordValid) {
      return null;
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    return admin;
  } catch (error: any) {
    console.error('Error verifying admin login:', error);
    throw new Error(error.message || 'Failed to verify admin login');
  }
};

// Get all farmers (for admin dashboard)
export const getAllFarmersForAdmin = async (limit: number = 50, skip: number = 0): Promise<{
  farmers: any[];
  total: number;
  pagination: {
    limit: number;
    skip: number;
    total: number;
    pages: number;
  };
}> => {
  try {
    const total = await Farmer.countDocuments();
    const farmers = await Farmer.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-passcode'); // Exclude sensitive data

    const pages = Math.ceil(total / limit);

    return {
      farmers,
      total,
      pagination: {
        limit,
        skip,
        total,
        pages
      }
    };
  } catch (error: any) {
    console.error('Error getting farmers for admin:', error);
    throw new Error(error.message || 'Failed to get farmers');
  }
};

// Delete farmer by ID
export const deleteFarmerById = async (farmerId: string): Promise<boolean> => {
  try {
    const result = await Farmer.findByIdAndDelete(farmerId);
    return result !== null;
  } catch (error: any) {
    console.error('Error deleting farmer:', error);
    throw new Error(error.message || 'Failed to delete farmer');
  }
};

// Get farmer by ID (for admin view)
export const getFarmerById = async (farmerId: string): Promise<any> => {
  try {
    const farmer = await Farmer.findById(farmerId).select('-passcode');
    return farmer;
  } catch (error: any) {
    console.error('Error getting farmer by ID:', error);
    throw new Error(error.message || 'Failed to get farmer');
  }
};

// Update farmer by ID
export const updateFarmerById = async (farmerId: string, updateData: any): Promise<any> => {
  try {
    const farmer = await Farmer.findByIdAndUpdate(
      farmerId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-passcode');
    
    return farmer;
  } catch (error: any) {
    console.error('Error updating farmer:', error);
    throw new Error(error.message || 'Failed to update farmer');
  }
};

// Update admin credentials
export const updateAdminCredentials = async (adminId: string, updateData: {
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<IAdmin | null> => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    // If updating password, verify current password
    if (updateData.newPassword) {
      if (!updateData.currentPassword) {
        throw new Error('Current password is required to change password');
      }
      
      const isCurrentPasswordValid = await bcrypt.compare(updateData.currentPassword, admin.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      updateData.newPassword = await bcrypt.hash(updateData.newPassword, 10);
    }

    // Prepare update data
    const updateFields: any = {};
    if (updateData.username) {
      // Check if username is already taken by another admin
      const existingAdmin = await Admin.findOne({ 
        username: updateData.username, 
        _id: { $ne: adminId } 
      });
      if (existingAdmin) {
        throw new Error('Username already exists');
      }
      updateFields.username = updateData.username;
    }
    if (updateData.newPassword) {
      updateFields.password = updateData.newPassword;
    }

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      updateFields,
      { new: true, runValidators: true }
    );

    return updatedAdmin;
  } catch (error: any) {
    console.error('Error updating admin credentials:', error);
    throw new Error(error.message || 'Failed to update admin credentials');
  }
};

// Get admin statistics
export const getAdminStats = async (): Promise<{
  totalFarmers: number;
  totalAdmins: number;
  recentFarmers: number;
  farmersByLocation: { [key: string]: number };
  farmersByCrop: { [key: string]: number };
}> => {
  try {
    const totalFarmers = await Farmer.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    
    // Recent farmers (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentFarmers = await Farmer.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Farmers by location
    const farmers = await Farmer.find({}, 'location cropsGrown');
    const farmersByLocation: { [key: string]: number } = {};
    const farmersByCrop: { [key: string]: number } = {};

    farmers.forEach(farmer => {
      // Count locations
      farmersByLocation[farmer.location] = (farmersByLocation[farmer.location] || 0) + 1;
      
      // Count crops
      farmer.cropsGrown.forEach(crop => {
        farmersByCrop[crop] = (farmersByCrop[crop] || 0) + 1;
      });
    });

    return {
      totalFarmers,
      totalAdmins,
      recentFarmers,
      farmersByLocation,
      farmersByCrop
    };
  } catch (error: any) {
    console.error('Error getting admin stats:', error);
    throw new Error(error.message || 'Failed to get admin statistics');
  }
};