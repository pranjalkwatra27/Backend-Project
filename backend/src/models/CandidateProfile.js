import mongoose from 'mongoose';

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    headline: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      index: true,
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    expectedCtc: {
      type: Number, // In LPA
      default: 0,
    },
    currentCtc: {
      type: Number, // In LPA
      default: 0,
    },
    noticePeriod: {
      type: String,
      enum: ['Immediate', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days'],
      default: '30 Days',
    },
    portfolioLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String, default: '' },
        startYear: { type: Number },
        endYear: { type: Number },
        grade: { type: String, default: '' },
      },
    ],
    experience: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' },
      },
    ],
    resumes: [
      {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number },
        mimeType: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    profileCompletionScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate profile completion score (0 to 100%)
candidateProfileSchema.methods.calculateCompletionScore = function () {
  let score = 0;
  if (this.headline && this.headline.trim().length > 5) score += 15;
  if (this.bio && this.bio.trim().length > 20) score += 15;
  if (this.skills && this.skills.length >= 3) score += 20;
  if (this.education && this.education.length > 0) score += 15;
  if (this.experience && this.experience.length > 0) score += 15;
  if (this.resumes && this.resumes.length > 0) score += 15;
  if (this.portfolioLinks && (this.portfolioLinks.github || this.portfolioLinks.linkedin || this.portfolioLinks.portfolio)) score += 5;
  
  this.profileCompletionScore = Math.min(score, 100);
  return this.profileCompletionScore;
};

// Pre-save hook to always update profileCompletionScore
candidateProfileSchema.pre('save', function (next) {
  this.calculateCompletionScore();
  next();
});

export const CandidateProfile = mongoose.model('CandidateProfile', candidateProfileSchema);
