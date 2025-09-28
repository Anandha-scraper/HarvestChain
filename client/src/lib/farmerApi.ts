// Farmer data interface
export interface FarmerData {
  firebaseUid: string;
  name: string;
  phoneNumber: string;
  passcode: string;
  aadharNumber: string;
  location: string;
  cropsGrown: string[];
}

export interface FarmerResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// API base URL
const API_BASE_URL = '/api/farmers';

// Create a new farmer
export const createFarmer = async (farmerData: FarmerData): Promise<FarmerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(farmerData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to create farmer');
    }

    return result;
  } catch (error: any) {
    console.error('Error creating farmer:', error);
    throw new Error(error.message || 'Failed to create farmer');
  }
};

// Get farmer by Firebase UID
export const getFarmerByFirebaseUid = async (firebaseUid: string): Promise<FarmerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/firebase/${firebaseUid}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to get farmer');
    }

    return result;
  } catch (error: any) {
    console.error('Error getting farmer by Firebase UID:', error);
    throw new Error(error.message || 'Failed to get farmer');
  }
};

// Get farmer by phone number
export const getFarmerByPhoneNumber = async (phoneNumber: string): Promise<FarmerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/phone/${phoneNumber}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to get farmer');
    }

    return result;
  } catch (error: any) {
    console.error('Error getting farmer by phone number:', error);
    throw new Error(error.message || 'Failed to get farmer');
  }
};

// Update farmer data
export const updateFarmer = async (firebaseUid: string, updateData: Partial<FarmerData>): Promise<FarmerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/update/${firebaseUid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update farmer');
    }

    return result;
  } catch (error: any) {
    console.error('Error updating farmer:', error);
    throw new Error(error.message || 'Failed to update farmer');
  }
};

// Check if farmer exists
export const farmerExists = async (firebaseUid: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/exists/${firebaseUid}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to check farmer existence');
    }

    return result.exists;
  } catch (error: any) {
    console.error('Error checking if farmer exists:', error);
    return false;
  }
};

// Login farmer with phone number and passcode
export const loginFarmer = async (phoneNumber: string, passcode: string): Promise<FarmerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, passcode }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to login farmer');
    }

    return result;
  } catch (error: any) {
    console.error('Error logging in farmer:', error);
    throw new Error(error.message || 'Failed to login farmer');
  }
};

// Get farmer statistics
export const getFarmerStats = async (): Promise<FarmerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to get farmer statistics');
    }

    return result;
  } catch (error: any) {
    console.error('Error getting farmer statistics:', error);
    throw new Error(error.message || 'Failed to get farmer statistics');
  }
};

// Update farmer crops
export const updateFarmerCrops = async (farmerId: string, crops: string[]): Promise<FarmerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/crops/${farmerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ crops }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update farmer crops');
    }

    return result;
  } catch (error: any) {
    console.error('Error updating farmer crops:', error);
    throw new Error(error.message || 'Failed to update farmer crops');
  }
};