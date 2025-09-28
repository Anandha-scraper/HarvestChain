import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  ConfirmationResult,
  User 
} from 'firebase/auth';
import { auth } from './firebase';

// Global variable to store the recaptcha verifier
let recaptchaVerifier: RecaptchaVerifier | null = null;

// Initialize reCAPTCHA verifier
export const initializeRecaptcha = (containerId: string = 'recaptcha-container'): RecaptchaVerifier => {
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  // Check if container exists
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`reCAPTCHA container with id '${containerId}' not found`);
    throw new Error(`reCAPTCHA container not found`);
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: (response: any) => {
      console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  });

  return recaptchaVerifier;
};

// Send OTP to phone number
export const sendOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
  try {
    // Ensure phone number has country code
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    // Initialize reCAPTCHA if not already done
    if (!recaptchaVerifier) {
      try {
        initializeRecaptcha();
      } catch (recaptchaError: any) {
        console.error('reCAPTCHA initialization error:', recaptchaError);
        throw new Error('reCAPTCHA initialization failed. Please refresh the page and try again.');
      }
    }

    // Send OTP
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier!);
    
    return confirmationResult;
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    throw new Error(error.message || 'Failed to send OTP');
  }
};

// Verify OTP
export const verifyOTP = async (confirmationResult: ConfirmationResult, otp: string): Promise<User> => {
  try {
    const result = await confirmationResult.confirm(otp);
    return result.user;
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    throw new Error(error.message || 'Invalid OTP');
  }
};

// Clear reCAPTCHA verifier
export const clearRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
    clearRecaptcha();
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};