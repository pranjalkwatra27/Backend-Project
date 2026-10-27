import path from 'path';
import fs from 'fs';
import { UPLOAD_PATH } from '../utils/fileHandler.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';

// @desc    Upload candidate resume
// @route   POST /api/uploads/resume
// @access  Private (Candidate)
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide a file to upload.' });
    }

    const { filename, originalname, size, mimetype } = req.file;
    const secureUrl = `/api/files/${filename}`;

    // Find or create profile
    let profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ userId: req.user._id });
    }

    const resumeItem = {
      filename,
      originalName: originalname,
      url: secureUrl,
      size,
      mimeType: mimetype,
      uploadedAt: new Date(),
    };

    profile.resumes.unshift(resumeItem);
    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully.',
      file: resumeItem,
      profileScore: profile.profileCompletionScore,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Secure, IDOR-protected file streaming
// @route   GET /api/files/:filename
// @access  Private (Owner Candidate, Job Recruiter, or Admin)
export const streamFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    // Prevent path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOAD_PATH, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Requested document not found on server.' });
    }

    // IDOR Security Check:
    // User can access if:
    // 1. User is Admin
    // 2. User is the Candidate who owns the resume in CandidateProfile
    // 3. User is a Recruiter whose job has an active application with this resume
    if (req.user.role !== 'admin') {
      const isOwner = await CandidateProfile.findOne({
        userId: req.user._id,
        'resumes.filename': safeFilename,
      });

      if (!isOwner) {
        if (req.user.role === 'recruiter') {
          // Check if recruiter posted any job where this resume was submitted
          const recruiterJobs = await Job.find({ recruiterId: req.user._id }).select('_id');
          const jobIds = recruiterJobs.map((j) => j._id);

          const application = await Application.findOne({
            jobId: { $in: jobIds },
            $or: [{ resumeFilename: safeFilename }, { resumeUrl: { $regex: safeFilename } }],
          });

          if (!application) {
            return res.status(403).json({
              success: false,
              message: 'Forbidden: You do not have permission to view this candidate document (IDOR protection).',
            });
          }
        } else {
          // Regular candidate trying to access another candidate's document
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Unauthorized document access attempt blocked.',
          });
        }
      }
    }

    // Node.js Streams & Buffers (Unit 2 syllabus)
    const ext = path.extname(safeFilename).toLowerCase();
    const contentType = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);

    // Stream the file chunk by chunk to response
    const readStream = fs.createReadStream(filePath);
    readStream.on('error', (err) => next(err));
    readStream.pipe(res);
  } catch (error) {
    next(error);
  }
};
