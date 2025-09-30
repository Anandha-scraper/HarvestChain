// Admin data interfaces
export interface AdminLoginData {
  username: string;
  password: string;
}

export interface AdminResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface FarmerData {
  _id: string;
  firebaseUid: string;
  name: string;
  phoneNumber: string;
  aadharNumber: string;
  location: string;
  cropsGrown: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalFarmers: number;
  totalAdmins: number;
  recentFarmers: number;
  farmersByLocation: { [key: string]: number };
  farmersByCrop: { [key: string]: number };
}

// API base URL
const API_BASE_URL = '/api/admin';

// Token utilities
const TOKEN_KEY = 'harvest_admin_token';

const saveToken = (token?: string) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch {}
};

const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Admin login
export const adminLogin = async (credentials: AdminLoginData): Promise<AdminResponse> => {
  try {
    console.log('Admin API: Sending login request to:', `${API_BASE_URL}/login`);
    console.log('Admin API: Credentials:', credentials);
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('Admin API: Response status:', response.status);
    const result = await response.json();
    console.log('Admin API: Response data:', result);
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to login');
    }
    // Persist token for subsequent requests
    if (result?.data?.token) {
      saveToken(result.data.token);
    }
    return result;
  } catch (error: any) {
    console.error('Error logging in admin:', error);
    throw new Error(error.message || 'Failed to login');
  }
};

// Initialize master admin
export const initializeMasterAdmin = async (): Promise<AdminResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/init-master`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to initialize master admin');
    }

    return result;
  } catch (error: any) {
    console.error('Error initializing master admin:', error);
    throw new Error(error.message || 'Failed to initialize master admin');
  }
};

// Get all farmers with pagination
export const getAllFarmers = async (limit: number = 50, skip: number = 0): Promise<{
  success: boolean;
  data: FarmerData[];
  pagination: {
    limit: number;
    skip: number;
    total: number;
    pages: number;
  };
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/farmers?limit=${limit}&skip=${skip}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to get farmers');
    }

    return result;
  } catch (error: any) {
    console.error('Error getting farmers:', error);
    throw new Error(error.message || 'Failed to get farmers');
  }
};

// Get farmer by ID
export const getFarmerById = async (farmerId: string): Promise<AdminResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/farmers/${farmerId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to get farmer');
    }

    return result;
  } catch (error: any) {
    console.error('Error getting farmer by ID:', error);
    throw new Error(error.message || 'Failed to get farmer');
  }
};

// Update farmer
export const updateFarmer = async (farmerId: string, updateData: Partial<FarmerData>): Promise<AdminResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/farmers/${farmerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
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

// Delete farmer
export const deleteFarmer = async (farmerId: string): Promise<AdminResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/farmers/${farmerId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete farmer');
    }

    return result;
  } catch (error: any) {
    console.error('Error deleting farmer:', error);
    throw new Error(error.message || 'Failed to delete farmer');
  }
};

// Get admin statistics
export const getAdminStats = async (): Promise<{
  success: boolean;
  data: AdminStats;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to get admin statistics');
    }

    return result;
  } catch (error: any) {
    console.error('Error getting admin stats:', error);
    throw new Error(error.message || 'Failed to get admin statistics');
  }
};

// Update admin credentials
export const updateAdminCredentials = async (adminId: string, credentials: {
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<AdminResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/credentials`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        adminId,
        ...credentials
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update admin credentials');
    }

    return result;
  } catch (error: any) {
    console.error('Error updating admin credentials:', error);
    throw new Error(error.message || 'Failed to update admin credentials');
  }
};