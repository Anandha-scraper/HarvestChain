import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrEracZBO8eiUpBk9H_wKbQozMJVdH0iQ",
  authDomain: "harvestchain-ipfs.firebaseapp.com",
  projectId: "harvestchain-ipfs",
  storageBucket: "harvestchain-ipfs.firebasestorage.app",
  messagingSenderId: "294474382769",
  appId: "1:294474382769:web:87a105cd1b97633c591190",
  measurementId: "G-LKE97PC136"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;