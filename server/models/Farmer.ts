import mongoose, { Document, Schema } from 'mongoose';

// Farmer interface
export interface IFarmer extends Document {
  firebaseUid: string;
  name: string;
  phoneNumber: string;
  passcode: string; // 4-digit passcode for login
  aadharNumber: string;
  location: string;
  cropsGrown: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Farmer schema
const farmerSchema = new Schema<IFarmer>({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  passcode: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 4
  },
  aadharNumber: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  cropsGrown: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Update the updatedAt field before saving
farmerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes are automatically created by unique: true constraints

// Create the model (explicit collection name 'farmers')
const Farmer = mongoose.model<IFarmer>('Farmer', farmerSchema, 'farmers');

export default Farmer;