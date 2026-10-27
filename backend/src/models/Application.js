import mongoose from 'mongoose';

// State machine definition: allowed stage transitions
export const STAGE_FLOW = {
  applied: ['shortlisted', 'rejected'],
  shortlisted: ['interview', 'rejected'],
  interview: ['offered', 'rejected'],
  offered: ['rejected'], // or final accepted
  rejected: ['applied', 'shortlisted'] // allows reconsidering candidate
};

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required for application'],
    },
    resumeFilename: {
      type: String,
    },
    coverNote: {
      type: String,
      trim: true,
      default: '',
    },
    stage: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview', 'offered', 'rejected'],
      default: 'applied',
      index: true,
    },
    stageHistory: [
      {
        stage: {
          type: String,
          enum: ['applied', 'shortlisted', 'interview', 'offered', 'rejected'],
          required: true,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: '',
        },
      },
    ],
    recruiterNotes: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        authorName: {
          type: String,
          default: 'Recruiter',
        },
        note: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Enforce unique application per candidate per job at database layer
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

// Helper to validate state machine transition
applicationSchema.methods.canTransitionTo = function (nextStage) {
  if (this.stage === nextStage) return true;
  const allowed = STAGE_FLOW[this.stage] || [];
  return allowed.includes(nextStage);
};

export const Application = mongoose.model('Application', applicationSchema);
