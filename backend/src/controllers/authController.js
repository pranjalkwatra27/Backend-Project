import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { CandidateProfile } from '../models/CandidateProfile.js';

// Generate JWT token helper
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'super_secret_jwt_key_talentpulse_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'candidate', company } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: ['candidate', 'recruiter', 'admin'].includes(role) ? role : 'candidate',
      company: role === 'recruiter' ? company : undefined,
    });

    // If candidate, initialize empty profile
    if (user.role === 'candidate') {
      await CandidateProfile.create({ userId: user._id });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        savedJobs: user.savedJobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'candidate') {
      profile = await CandidateProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        savedJobs: user.savedJobs,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    One-click demo login for reviewers
// @route   POST /api/auth/demo-login
// @access  Public
export const demoLogin = async (req, res, next) => {
  try {
    const { role = 'candidate' } = req.body;
    let email;
    if (role === 'recruiter') email = 'sarah.recruiter@stripe.demo';
    else if (role === 'admin') email = 'alex.admin@talentpulse.demo';
    else email = 'david.candidate@gmail.demo';

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo user for role '${role}' not found. Please run seed script first.`,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: `Logged in as demo ${role}.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        savedJobs: user.savedJobs,
      },
    });
  } catch (error) {
    next(error);
  }
};
