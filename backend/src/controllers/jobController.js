import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { appEvents } from '../events/appEvents.js';

// @desc    Get all jobs with faceted search & filtering
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res, next) => {
  try {
    const {
      q,
      role,
      location,
      workMode,
      minExp,
      maxExp,
      ctcMin,
      ctcMax,
      skills,
      status = 'active',
      page = 1,
      limit = 10,
      sort = 'newest',
      recruiterId,
    } = req.query;

    const query = {};

    // Filter by recruiter if requested (for recruiter dashboard)
    if (recruiterId) {
      query.recruiterId = recruiterId;
    } else if (status !== 'all') {
      // By default public view shows active jobs only
      query.status = status;
    }

    // Keyword search (Title, Role, Description, or Company Name)
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [
        { title: regex },
        { role: regex },
        { 'company.name': regex },
        { description: regex },
        { skills: { $in: [regex] } },
      ];
    }

    // Role filter
    if (role && role.trim()) {
      query.role = new RegExp(role.trim(), 'i');
    }

    // Location filter
    if (location && location.trim()) {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Work Mode filter
    if (workMode && workMode !== 'All') {
      query.workMode = workMode;
    }

    // Experience filter (minExp)
    if (minExp !== undefined && minExp !== '') {
      query.minExp = { $lte: Number(minExp) };
    }
    if (maxExp !== undefined && maxExp !== '') {
      query.maxExp = { $gte: Number(maxExp) };
    }

    // CTC Range filter
    if (ctcMin !== undefined && ctcMin !== '') {
      query['ctcRange.max'] = { ...(query['ctcRange.max'] || {}), $gte: Number(ctcMin) };
    }
    if (ctcMax !== undefined && ctcMax !== '') {
      query['ctcRange.min'] = { ...(query['ctcRange.min'] || {}), $lte: Number(ctcMax) };
    }

    // Skills filter (comma-separated or single)
    if (skills) {
      const skillsArray = typeof skills === 'string' ? skills.split(',').map((s) => s.trim()) : skills;
      if (skillsArray.length > 0) {
        query.skills = { $in: skillsArray.map((s) => new RegExp(`^${s}$`, 'i')) };
      }
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'salary_high') {
      sortOption = { 'ctcRange.max': -1 };
    } else if (sort === 'salary_low') {
      sortOption = { 'ctcRange.min': 1 };
    } else if (sort === 'experience_low') {
      sortOption = { minExp: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * pageSize;

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('recruiterId', 'name email company')
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total: totalJobs,
      totalPages: Math.ceil(totalJobs / pageSize),
      currentPage: pageNum,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiterId', 'name email company');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    // Check application count for this job
    const applicantsCount = await Application.countDocuments({ jobId: job._id });

    res.status(200).json({
      success: true,
      job: {
        ...job.toObject(),
        applicantsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter only)
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      role,
      department,
      description,
      requirements,
      responsibilities,
      skills,
      location,
      workMode,
      minExp,
      maxExp,
      ctcRange,
      deadline,
      company,
    } = req.body;

    const companyData = {
      name: company?.name || req.user.company?.name || 'Hiring Company',
      website: company?.website || req.user.company?.website || '',
      logoUrl: company?.logoUrl || req.user.company?.logoUrl || '',
      location: company?.location || req.user.company?.location || location,
    };

    const newJob = await Job.create({
      recruiterId: req.user._id,
      company: companyData,
      title,
      role: role || title,
      department: department || 'Engineering',
      description,
      requirements: Array.isArray(requirements) ? requirements : requirements ? requirements.split('\n').filter(Boolean) : [],
      responsibilities: Array.isArray(responsibilities) ? responsibilities : responsibilities ? responsibilities.split('\n').filter(Boolean) : [],
      skills: Array.isArray(skills) ? skills : skills ? skills.split(',').map((s) => s.trim()) : [],
      location,
      workMode: workMode || 'Hybrid',
      minExp: Number(minExp) || 0,
      maxExp: Number(maxExp) || 5,
      ctcRange: {
        min: Number(ctcRange?.min) || 5,
        max: Number(ctcRange?.max) || 15,
        currency: ctcRange?.currency || 'INR',
        isPublic: ctcRange?.isPublic !== false,
      },
      deadline: deadline ? new Date(deadline) : undefined,
      status: 'active',
    });

    appEvents.emit('job:statusUpdated', {
      jobId: newJob._id,
      title: newJob.title,
      status: newJob.status,
    });

    res.status(201).json({
      success: true,
      message: 'Job posting published successfully.',
      job: newJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job posting
// @route   PATCH /api/jobs/:id
// @access  Private (Recruiter owner or Admin)
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    // Ownership check
    if (req.user.role !== 'admin' && job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit jobs that you posted.',
      });
    }

    // Format array fields if sent as strings
    if (req.body.skills && typeof req.body.skills === 'string') {
      req.body.skills = req.body.skills.split(',').map((s) => s.trim());
    }
    if (req.body.requirements && typeof req.body.requirements === 'string') {
      req.body.requirements = req.body.requirements.split('\n').filter(Boolean);
    }
    if (req.body.responsibilities && typeof req.body.responsibilities === 'string') {
      req.body.responsibilities = req.body.responsibilities.split('\n').filter(Boolean);
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully.',
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close job posting
// @route   PATCH /api/jobs/:id/close
// @access  Private (Recruiter owner or Admin)
export const closeJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    if (req.user.role !== 'admin' && job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only close jobs that you posted.',
      });
    }

    job.status = 'closed';
    await job.save();

    appEvents.emit('job:statusUpdated', {
      jobId: job._id,
      title: job.title,
      status: 'closed',
    });

    res.status(200).json({
      success: true,
      message: 'Job closed successfully.',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter owner or Admin)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (req.user.role !== 'admin' && job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only delete jobs that you posted.' });
    }

    // Cascade delete associated applications
    await Application.deleteMany({ jobId: job._id });
    await Job.findByIdAndDelete(job._id);

    res.status(200).json({
      success: true,
      message: 'Job and associated applications removed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a specific job
// @route   GET /api/jobs/:id/applicants
// @access  Private (Recruiter owner of that job or Admin)
export const getJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Enforce recruiter ownership check (placement interview angle: preventing IDOR)
    if (req.user.role !== 'admin' && job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view applicants for jobs you own.',
      });
    }

    const applications = await Application.find({ jobId: job._id })
      .populate('candidateId', 'name email createdAt')
      .sort({ createdAt: -1 });

    // Fetch candidate profiles to attach skills, headline, experience
    const candidateIds = applications.map((app) => app.candidateId?._id).filter(Boolean);
    const profiles = await CandidateProfile.find({ userId: { $in: candidateIds } });
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    const enrichedApplicants = applications.map((app) => {
      const appObj = app.toObject();
      const profile = app.candidateId ? profileMap[app.candidateId._id.toString()] : null;
      return {
        ...appObj,
        candidateProfile: profile || null,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedApplicants.length,
      job: {
        id: job._id,
        title: job.title,
        role: job.role,
        status: job.status,
      },
      applicants: enrichedApplicants,
    });
  } catch (error) {
    next(error);
  }
};
