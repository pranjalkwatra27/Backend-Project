import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { appEvents } from '../events/appEvents.js';

export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, resumeUrl, resumeFilename, coverNote } = req.body;

    if (!jobId || !resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Job ID and resume are required to apply.',
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Target job posting not found.' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `This job is currently ${job.status} and cannot accept new applications.`,
      });
    }

    const existing = await Application.findOne({ jobId, candidateId: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this position.',
      });
    }

    const application = await Application.create({
      jobId,
      candidateId: req.user._id,
      resumeUrl,
      resumeFilename: resumeFilename || resumeUrl.split('/').pop(),
      coverNote: coverNote || '',
      stage: 'applied',
      stageHistory: [
        {
          stage: 'applied',
          changedBy: req.user._id,
          changedAt: new Date(),
          note: 'Application submitted by candidate.',
        },
      ],
    });

    appEvents.emit('application:submitted', {
      applicationId: application._id,
      candidateName: req.user.name,
      jobTitle: job.title,
      companyName: job.company.name,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate('jobId', 'title role company location workMode minExp ctcRange status deadline')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStage = async (req, res, next) => {
  try {
    const { stage, note } = req.body;
    const validStages = ['applied', 'shortlisted', 'interview', 'offered', 'rejected'];

    if (!validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage. Must be one of: ${validStages.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('jobId', 'title recruiterId company')
      .populate('candidateId', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    if (req.user.role !== 'admin' && application.jobId.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to update applicants for this job.',
      });
    }

    const oldStage = application.stage;
    if (!application.canTransitionTo(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage transition from '${oldStage}' to '${stage}'. Permitted transitions follow the recruitment pipeline order.`,
      });
    }

    application.stage = stage;
    application.stageHistory.push({
      stage,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: note || `Stage updated to ${stage}`,
    });

    await application.save();

    appEvents.emit('application:stageChanged', {
      applicationId: application._id,
      candidateEmail: application.candidateId?.email,
      jobTitle: application.jobId?.title,
      oldStage,
      newStage: stage,
    });

    res.status(200).json({
      success: true,
      message: `Applicant moved to '${stage}' stage successfully.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const addRecruiterNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note text cannot be empty.' });
    }

    const application = await Application.findById(req.params.id).populate('jobId', 'recruiterId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    if (req.user.role !== 'admin' && application.jobId.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot comment on this applicant.' });
    }

    application.recruiterNotes.push({
      author: req.user._id,
      authorName: req.user.name,
      note: note.trim(),
      createdAt: new Date(),
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Evaluation note added.',
      notes: application.recruiterNotes,
    });
  } catch (error) {
    next(error);
  }
};
