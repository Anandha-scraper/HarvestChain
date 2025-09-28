import mongoose, { Document, Schema } from 'mongoose';

// Admin interface
export interface IAdmin extends Document {
  username: string;
  password: string;
  role: 'master' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Admin schema
const adminSchema = new Schema<IAdmin>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['master', 'admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
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
adminSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create the model
const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;