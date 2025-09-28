import { getFirestore, doc, setDoc, getDoc, collection } from 'firebase/firestore';
import app from './firebase';

// Initialize Firestore
export const db = getFirestore(app);

// Farmer data interface
export interface FarmerData {
  uid: string;
  name: string;
  phoneNumber: string;
  aadharNumber: string;
  location: string;
  cropsGrown: string[];
  createdAt: string;
  updatedAt: string;
}

// Save farmer data to Firestore
export const saveFarmerData = async (farmerData: FarmerData): Promise<void> => {
  try {
    const farmerRef = doc(db, 'farmers', farmerData.uid);
    await setDoc(farmerRef, farmerData);
    console.log('Farmer data saved to Firestore:', farmerData.uid);
  } catch (error) {
    console.error('Error saving farmer data:', error);
    throw error;
  }
};

// Get farmer data from Firestore
export const getFarmerData = async (uid: string): Promise<FarmerData | null> => {
  try {
    const farmerRef = doc(db, 'farmers', uid);
    const farmerSnap = await getDoc(farmerRef);
    
    if (farmerSnap.exists()) {
      return farmerSnap.data() as FarmerData;
    } else {
      console.log('No farmer data found for UID:', uid);
      return null;
    }
  } catch (error) {
    console.error('Error getting farmer data:', error);
    throw error;
  }
};

// Check if farmer exists
export const farmerExists = async (uid: string): Promise<boolean> => {
  try {
    const farmerData = await getFarmerData(uid);
    return farmerData !== null;
  } catch (error) {
    console.error('Error checking if farmer exists:', error);
    return false;
  }
};