import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import { User } from '../models/User.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { UPLOAD_PATH } from '../utils/fileHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_portal_db';
    console.log(`[Seed] Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri);

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await CandidateProfile.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    const sampleResumeName = 'resume-david-chen-sample.pdf';
    const sampleResumePath = path.join(UPLOAD_PATH, sampleResumeName);
    if (!fs.existsSync(sampleResumePath)) {
      fs.writeFileSync(sampleResumePath, '%PDF-1.4\n1 0 obj\n<< /Title (David Chen Resume) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    }

    console.log('[Seed] Creating demo users with hashed passwords...');
    const defaultPassword = await User.hashPassword('Password123!');

    const adminUser = await User.create({
      name: 'Alex Vance (Platform Admin)',
      email: 'alex.admin@candidex.demo',
      passwordHash: defaultPassword,
      role: 'admin',
    });

    const recruiter1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.recruiter@stripe.demo',
      passwordHash: defaultPassword,
      role: 'recruiter',
      company: {
        name: 'Stripe',
        website: 'https://stripe.com',
        location: 'Bangalore, India (Hybrid)',
        logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&q=80',
        bio: 'Financial infrastructure for the internet millions of businesses use Stripe software.',
      },
    });

    const recruiter2 = await User.create({
      name: 'Marcus Vance',
      email: 'marcus.recruiter@linear.demo',
      passwordHash: defaultPassword,
      role: 'recruiter',
      company: {
        name: 'Linear',
        website: 'https://linear.app',
        location: 'Remote',
        logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&q=80',
        bio: 'Linear is the standard for modern software engineering teams and product builders.',
      },
    });

    const candidate1 = await User.create({
      name: 'David Chen',
      email: 'david.candidate@gmail.demo',
      passwordHash: defaultPassword,
      role: 'candidate',
    });

    const candidate2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.dev@gmail.demo',
      passwordHash: defaultPassword,
      role: 'candidate',
    });

    console.log('[Seed] Building candidate profiles...');
    await CandidateProfile.create({
      userId: candidate1._id,
      headline: 'Full-Stack Software Engineer | React, Node.js & Cloud Architecture',
      bio: 'Product-focused software engineer with 4+ years building high-throughput microservices, responsive web applications, and intuitive user experiences. Passionate about system design, accessibility, and clean code.',
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'Tailwind CSS', 'Docker', 'REST APIs'],
      experienceYears: 4,
      expectedCtc: 24,
      currentCtc: 16,
      noticePeriod: '15 Days',
      portfolioLinks: {
        github: 'https://github.com/davidchen-demo',
        linkedin: 'https://linkedin.com/in/davidchen-demo',
        portfolio: 'https://davidchen.dev',
      },
      education: [
        {
          institution: 'National Institute of Technology',
          degree: 'B.Tech in Computer Science',
          fieldOfStudy: 'Computer Science & Engineering',
          startYear: 2018,
          endYear: 2022,
          grade: '8.8 / 10 CGPA',
        },
      ],
      experience: [
        {
          company: 'HyperGrowth Systems',
          role: 'Senior Software Engineer',
          location: 'Bangalore, India',
          startDate: 'July 2022',
          endDate: 'Present',
          current: true,
          description: 'Architected payment processing engine scaling to 50k transactions/sec. Migrated frontend to React and Tailwind CSS.',
        },
        {
          company: 'PixelCraft Labs',
          role: 'Frontend Developer Intern',
          location: 'Remote',
          startDate: 'Jan 2022',
          endDate: 'June 2022',
          current: false,
          description: 'Developed design tokens and reusable component libraries in React.',
        },
      ],
      resumes: [
        {
          filename: sampleResumeName,
          originalName: 'David_Chen_Resume_2026.pdf',
          url: `/api/files/${sampleResumeName}`,
          size: 145000,
          mimeType: 'application/pdf',
          uploadedAt: new Date(),
        },
      ],
    });

    await CandidateProfile.create({
      userId: candidate2._id,
      headline: 'Backend Engineer & Distributed Systems Enthusiast',
      bio: 'Software engineer specializing in high-performance backends, database query optimization, Redis caching, and Dockerized microservices.',
      phone: '+91 91234 56789',
      location: 'Hyderabad, India',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Redis', 'GraphQL'],
      experienceYears: 3,
      expectedCtc: 20,
      currentCtc: 14,
      noticePeriod: '30 Days',
      portfolioLinks: {
        github: 'https://github.com/priyasharma-demo',
        linkedin: 'https://linkedin.com/in/priyasharma-demo',
      },
      education: [
        {
          institution: 'Birla Institute of Technology and Science',
          degree: 'B.E. in Electronics and Electrical',
          fieldOfStudy: 'Distributed Systems',
          startYear: 2019,
          endYear: 2023,
          grade: '8.5 CGPA',
        },
      ],
      experience: [
        {
          company: 'FinStack Technologies',
          role: 'Software Development Engineer I',
          location: 'Hyderabad',
          startDate: 'August 2023',
          endDate: 'Present',
          current: true,
          description: 'Built reconciliation pipeline for card settlements with Node.js and PostgreSQL.',
        },
      ],
      resumes: [
        {
          filename: sampleResumeName,
          originalName: 'Priya_Sharma_Resume.pdf',
          url: `/api/files/${sampleResumeName}`,
          size: 132000,
          mimeType: 'application/pdf',
          uploadedAt: new Date(),
        },
      ],
    });

    console.log('[Seed] Seeding realistic job postings...');
    const jobs = await Job.insertMany([
      {
        recruiterId: recruiter1._id,
        company: recruiter1.company,
        title: 'Senior Full-Stack Engineer (Node.js & React)',
        role: 'Senior Full-Stack Engineer',
        department: 'Core Infrastructure',
        description: 'Stripe is looking for a Senior Full Stack Engineer to join our payments experience team. You will lead the development of developer-facing dashboards, payment flow builders, and mission-critical API integrations handling billions of dollars in volume.',
        requirements: [
          '4+ years of professional full-stack development experience with Node.js and React',
          'Deep understanding of asynchronous programming, event loop, and RESTful API architecture',
          'Proficiency with MongoDB or relational databases, schema design, and compound indexing',
          'Experience enforcing web security, preventing IDOR vulnerabilities, and securing file uploads',
        ],
        responsibilities: [
          'Design and maintain scalable REST APIs and responsive UI dashboards',
          'Collaborate with product designers and security auditors on production readiness',
          'Optimize database queries and implement server-side caching pipelines',
        ],
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Tailwind CSS'],
        location: 'Bangalore, India',
        workMode: 'Hybrid',
        minExp: 4,
        maxExp: 8,
        ctcRange: { min: 25, max: 40, currency: 'INR', isPublic: true },
        status: 'active',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        recruiterId: recruiter1._id,
        company: recruiter1.company,
        title: 'Backend Platform Engineer (Distributed Systems)',
        role: 'Backend Platform Engineer',
        department: 'Platform Engineering',
        description: 'Join Stripe Platform Engineering to scale global financial transactions. You will architect fault-tolerant distributed services, optimize data ingestion streams, and maintain bulletproof security.',
        requirements: [
          '3+ years backend experience with Node.js, Go, or Python',
          'Expertise with database transaction semantics, compound indexes, and ACID guarantees',
          'Strong grasp of Node streams, buffers, and event-driven architecture',
        ],
        responsibilities: [
          'Implement low-latency API endpoints and webhook ingestion pipelines',
          'Design and monitor automated state machines for payment lifecycle transitions',
        ],
        skills: ['Node.js', 'MongoDB', 'Express', 'Redis', 'Docker', 'REST APIs'],
        location: 'Bangalore, India',
        workMode: 'On-site',
        minExp: 3,
        maxExp: 7,
        ctcRange: { min: 22, max: 35, currency: 'INR', isPublic: true },
        status: 'active',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      },
      {
        recruiterId: recruiter2._id,
        company: recruiter2.company,
        title: 'Frontend Product Engineer (Design Systems & React)',
        role: 'Frontend Product Engineer',
        department: 'Product Experience',
        description: 'Linear is hiring a Frontend Product Engineer passionate about building keyboard-first, ultra-responsive web applications. We care deeply about craft, animation polish, typography, and exceptional UX ergonomics.',
        requirements: [
          '3+ years creating delightful, high-craft web interfaces in React and modern CSS',
          'Expert knowledge of DOM events, state management, and semantic HTML',
          'Eye for aesthetic subtlety, typography hierarchy, and spacing tokens',
        ],
        responsibilities: [
          'Build buttery smooth, keyboard-accessible UI components',
          'Maintain and evolve our design system tokens',
        ],
        skills: ['React', 'JavaScript', 'Tailwind CSS', 'TypeScript', 'HTML/CSS'],
        location: 'Remote',
        workMode: 'Remote',
        minExp: 2,
        maxExp: 6,
        ctcRange: { min: 28, max: 45, currency: 'INR', isPublic: true },
        status: 'active',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      {
        recruiterId: recruiter2._id,
        company: recruiter2.company,
        title: 'Cloud Infrastructure & DevOps Specialist',
        role: 'DevOps Specialist',
        department: 'Site Reliability Engineering',
        description: 'Scale Linear cloud deployments across global edge regions. Automate CI/CD pipelines, containerize microservices, and ensure 99.99% system availability.',
        requirements: [
          '3+ years managing production cloud infrastructure (AWS/GCP)',
          'Experience with Docker, Kubernetes, CI/CD pipelines, and secret management',
        ],
        responsibilities: [
          'Automate zero-downtime blue/green deployment workflows',
          'Implement proactive monitoring, logging, and security alerting',
        ],
        skills: ['Docker', 'AWS', 'Linux', 'Node.js', 'CI/CD'],
        location: 'Remote',
        workMode: 'Remote',
        minExp: 3,
        maxExp: 7,
        ctcRange: { min: 20, max: 32, currency: 'INR', isPublic: true },
        status: 'active',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        recruiterId: recruiter1._id,
        company: recruiter1.company,
        title: 'Junior Web Developer (Placement Training Cohort)',
        role: 'Junior Web Developer',
        department: 'Developer Acceleration',
        description: 'Designed specifically for ambitious graduates looking to transition into software engineering. Mentored by senior engineers on production codebases.',
        requirements: [
          'Strong grasp of HTML, CSS, JavaScript, and Node.js fundamentals',
          'Familiarity with Express routing, REST principles, and Git version control',
        ],
        responsibilities: [
          'Write clean, tested components and REST API endpoints',
          'Participate in code reviews and pair programming sessions',
        ],
        skills: ['JavaScript', 'HTML/CSS', 'Node.js', 'Express', 'React'],
        location: 'Bangalore, India',
        workMode: 'Hybrid',
        minExp: 0,
        maxExp: 2,
        ctcRange: { min: 8, max: 14, currency: 'INR', isPublic: true },
        status: 'active',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('[Seed] Creating demo applications across pipeline stages...');

    await Application.create({
      jobId: jobs[0]._id,
      candidateId: candidate1._id,
      resumeUrl: `/api/files/${sampleResumeName}`,
      resumeFilename: sampleResumeName,
      coverNote: 'I have 4 years of deep Node.js and React experience building high-throughput payment architectures. Stripe is my dream team.',
      stage: 'interview',
      stageHistory: [
        {
          stage: 'applied',
          changedBy: candidate1._id,
          changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          note: 'Applied through platform.',
        },
        {
          stage: 'shortlisted',
          changedBy: recruiter1._id,
          changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          note: 'Strong portfolio and relevant payment experience.',
        },
        {
          stage: 'interview',
          changedBy: recruiter1._id,
          changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          note: 'Scheduled technical system design round.',
        },
      ],
      recruiterNotes: [
        {
          author: recruiter1._id,
          authorName: 'Sarah Jenkins',
          note: 'Candidate demonstrated clear understanding of compound indexing and IDOR protection during screening.',
          createdAt: new Date(),
        },
      ],
    });

    await Application.create({
      jobId: jobs[2]._id,
      candidateId: candidate1._id,
      resumeUrl: `/api/files/${sampleResumeName}`,
      resumeFilename: sampleResumeName,
      coverNote: 'Love the craft and micro-interactions in Linear. Excelling at design systems and TypeScript.',
      stage: 'offered',
      stageHistory: [
        { stage: 'applied', changedBy: candidate1._id, changedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), note: 'Applied' },
        { stage: 'shortlisted', changedBy: recruiter2._id, changedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), note: 'Impressive GitHub projects' },
        { stage: 'interview', changedBy: recruiter2._id, changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), note: 'Aced UI challenge' },
        { stage: 'offered', changedBy: recruiter2._id, changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Extended formal offer letter' },
      ],
      recruiterNotes: [
        {
          author: recruiter2._id,
          authorName: 'Marcus Vance',
          note: 'Top percentile candidate on design polish and keyboard accessibility.',
          createdAt: new Date(),
        },
      ],
    });

    await Application.create({
      jobId: jobs[1]._id,
      candidateId: candidate2._id,
      resumeUrl: `/api/files/${sampleResumeName}`,
      resumeFilename: sampleResumeName,
      coverNote: 'Specialized in asynchronous Node.js microservices and database query indexing.',
      stage: 'shortlisted',
      stageHistory: [
        { stage: 'applied', changedBy: candidate2._id, changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Applied' },
        { stage: 'shortlisted', changedBy: recruiter1._id, changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Profile matches backend requirements' },
      ],
    });

    await Application.create({
      jobId: jobs[3]._id,
      candidateId: candidate2._id,
      resumeUrl: `/api/files/${sampleResumeName}`,
      resumeFilename: sampleResumeName,
      coverNote: 'Hands-on experience with Docker, AWS and CI/CD pipelines.',
      stage: 'applied',
      stageHistory: [
        { stage: 'applied', changedBy: candidate2._id, changedAt: new Date(), note: 'Initial application' },
      ],
    });

    candidate1.savedJobs.push(jobs[1]._id);
    await candidate1.save();

    console.log('[Seed] Database successfully seeded with demo accounts!');
    console.log('------------------------------------------------------------');
    console.log('Demo Credentials for Testing:');
    console.log('  Candidate:  david.candidate@gmail.demo   /  Password123!');
    console.log('  Recruiter:  sarah.recruiter@stripe.demo  /  Password123!');
    console.log('  Admin:      alex.admin@candidex.demo  /  Password123!');
    console.log('------------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
