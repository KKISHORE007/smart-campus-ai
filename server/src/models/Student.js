// ============================================================
// Student Helpdesk Agent — Model: Student
// ============================================================
// Scoped to institutionId for multi-tenant isolation.
// ============================================================

import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    institutionId: {
      type: String,
      required: true,
      index: true,
      default: 'inst-xyz-001',
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    interests: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.methods.toContextString = function () {
  const parts = [
    `Name: ${this.name}`,
    `Department: ${this.department}`,
    `Year: ${this.year}`,
  ];
  if (this.interests.length > 0) {
    parts.push(`Interests: ${this.interests.join(', ')}`);
  }
  return parts.join(' | ');
};

const Student = mongoose.model('Student', studentSchema);
export default Student;
