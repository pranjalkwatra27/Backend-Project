import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';

// @desc    Get aggregated platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
export const getPlatformAnalytics = async (req, res, next) => {
  try {
    // 1. Pipeline Funnel Aggregation
    const funnelStages = await Application.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
        },
      },
    ]);

    const funnelMap = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      rejected: 0,
    };
    funnelStages.forEach((item) => {
      if (item._id && funnelMap.hasOwnProperty(item._id)) {
        funnelMap[item._id] = item.count;
      }
    });

    // 2. Jobs by Work Mode Aggregation
    const workModeDist = await Job.aggregate([
      {
        $group: {
          _id: '$workMode',
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. User counts by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. Totals summary
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await Application.countDocuments();
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      analytics: {
        summary: {
          totalUsers,
          totalJobs,
          activeJobs,
          totalApplications,
          placementRate:
            totalApplications > 0
              ? `${Math.round(((funnelMap.offered || 0) / totalApplications) * 100)}%`
              : '0%',
        },
        funnel: funnelMap,
        workModes: workModeDist.map((item) => ({ name: item._id, value: item.count })),
        userRoles: usersByRole.map((item) => ({ role: item._id, count: item.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs across platform with filters
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
export const getAdminJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('recruiterId', 'name email company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job status (moderation: approve / reject / close)
// @route   PATCH /api/admin/jobs/:id/status
// @access  Private (Admin only)
export const updateJobModerationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'closed', 'draft', 'pending_approval'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const job = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Job moderation status changed to '${status}'.`,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAdminUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status or change role
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin only)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;
    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role && ['candidate', 'recruiter', 'admin'].includes(role)) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'User status updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};
