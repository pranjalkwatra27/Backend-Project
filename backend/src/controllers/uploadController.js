import path from 'path';
import fs from 'fs';
import { UPLOAD_PATH } from '../utils/fileHandler.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide a file to upload.' });
    }

    const { filename, originalname, size, mimetype } = req.file;
    const secureUrl = `/api/files/${filename}`;

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

export const streamFile = async (req, res, next) => {
  try {
    const { filename } = req.params;

    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOAD_PATH, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Requested document not found on server.' });
    }

    if (req.user.role !== 'admin') {
      const isOwner = await CandidateProfile.findOne({
        userId: req.user._id,
        'resumes.filename': safeFilename,
      });

      if (!isOwner) {
        if (req.user.role === 'recruiter') {
          const recruiterJobs = await Job.find({ recruiterId: req.user._id }).select('_id');
          const jobIds = recruiterJobs.map((j) => j._id);

          const escaped = safeFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const application = await Application.findOne({
            jobId: { $in: jobIds },
            $or: [{ resumeFilename: safeFilename }, { resumeUrl: { $regex: escaped } }],
          });

          if (!application) {
            return res.status(403).json({
              success: false,
              message: 'Forbidden: You do not have permission to view this candidate document (IDOR protection).',
            });
          }
        } else {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Unauthorized document access attempt blocked.',
          });
        }
      }
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const contentType = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);

    const readStream = fs.createReadStream(filePath);
    readStream.on('error', (err) => next(err));
    readStream.pipe(res);
  } catch (error) {
    next(error);
  }
};
