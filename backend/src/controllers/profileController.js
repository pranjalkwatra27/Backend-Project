import { CandidateProfile } from '../models/CandidateProfile.js';
import { User } from '../models/User.js';

export const getMyProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await CandidateProfile.create({ userId: req.user._id });
    }

    res.status(200).json({
      success: true,
      profile,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        company: req.user.company,
      },
      score: profile.profileCompletionScore,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ userId: req.user._id });
    }

    const {
      headline,
      bio,
      phone,
      location,
      skills,
      experienceYears,
      expectedCtc,
      currentCtc,
      noticePeriod,
      portfolioLinks,
      education,
      experience,
    } = req.body;

    if (headline !== undefined) profile.headline = headline;
    if (bio !== undefined) profile.bio = bio;
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (skills !== undefined) {
      profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    }
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (expectedCtc !== undefined) profile.expectedCtc = Number(expectedCtc);
    if (currentCtc !== undefined) profile.currentCtc = Number(currentCtc);
    if (noticePeriod !== undefined) profile.noticePeriod = noticePeriod;
    if (portfolioLinks !== undefined) profile.portfolioLinks = portfolioLinks;
    if (education !== undefined) profile.education = education;
    if (experience !== undefined) profile.experience = experience;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile,
      score: profile.profileCompletionScore,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user._id);

    const isSaved = user.savedJobs.some((id) => id.toString() === jobId);
    if (isSaved) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      saved: !isSaved,
      message: !isSaved ? 'Job saved to your bookmarks.' : 'Job removed from bookmarks.',
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      populate: { path: 'recruiterId', select: 'name email company' },
    });

    res.status(200).json({
      success: true,
      savedJobs: user.savedJobs || [],
    });
  } catch (error) {
    next(error);
  }
};
