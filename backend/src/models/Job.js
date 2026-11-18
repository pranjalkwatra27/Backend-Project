import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      name: { type: String, required: true, trim: true },
      website: { type: String, default: '' },
      logoUrl: { type: String, default: '' },
      location: { type: String, default: '' },
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: 'Engineering',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: [
      {
        type: String,
      },
    ],
    responsibilities: [
      {
        type: String,
      },
    ],
    skills: {
      type: [String],
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Hybrid',
      index: true,
    },
    minExp: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    maxExp: {
      type: Number,
      default: 5,
    },
    ctcRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      isPublic: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'pending_approval'],
      default: 'active',
      index: true,
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ role: 1, location: 1, minExp: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ 'ctcRange.min': 1, 'ctcRange.max': 1 });
jobSchema.index(
  { title: 'text', description: 'text', role: 'text', skills: 'text' },
  { weights: { title: 10, role: 8, skills: 6, description: 1 } }
);

export const Job = mongoose.model('Job', jobSchema);
