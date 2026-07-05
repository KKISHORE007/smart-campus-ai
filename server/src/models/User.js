// ============================================================
// Student Helpdesk Agent — Model: User (Authentication)
// ============================================================
// Mongoose schema for role-based users:
// Roles: student, staff, hod, super_admin
// Scoped to institutionId.
// ============================================================

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    loginId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'staff', 'hod', 'super_admin', 'admin'],
      default: 'student',
    },
    institutionId: {
      type: String,
      required: true,
      index: true,
      default: 'inst-xyz-001',
    },
    department: {
      type: String,
      default: 'General Engineering',
    },
    year: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if user has super admin / admin privileges
userSchema.methods.isAdmin = function () {
  return this.role === 'super_admin' || this.role === 'admin';
};

// Return user object without sensitive password field
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
