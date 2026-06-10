import JobPosting from '../models/JobPosting.js';
import Application from '../models/Application.js';
import employeeModel from "../models/Employee.js";
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { notifyUser, notifyManyUsers } from '../services/notificationService.js';


export const listJobs = async (req, res) => {
  try {
    const { status = 'open', department, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [jobs, total] = await Promise.all([
      JobPosting.find(filter)
        .populate('postedBy', 'firstName lastName')
        .sort({ postedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      JobPosting.countDocuments(filter)
    ]);

    res.json({
      jobs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}

/**
 * Get a single job posting by ID (public)
 */
export const getJobById = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id).populate('postedBy', 'firstName lastName');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
}

/**
 * Create a job posting (HR/Admin only)
 */
export async function createJob(req, res) {
  try {
    const { title, description, department, requirements, closingDate } = req.body;
    const employee = await employeeModel.findOne({ user: req.user._id });
    if (!employee) return res.status(403).json({ error: 'Employee profile not found' });

    const job = await JobPosting.create({
      title,
      description,
      department,
      requirements: requirements || [],
      postedBy: employee._id,
      postedDate: new Date(),
      closingDate: closingDate || null,
      status: 'open'
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE_JOB',
      entityType: 'JobPosting',
      performedBy: employee._id,
      entityId: job._id,
      newData: { title, department, requirements }
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create job posting' });
  }
}

/**
 * Update a job posting (HR/Admin only)
 */
export const updateJob = async (req, res) => {
  try {
    const updates = req.body;
    const job = await JobPosting.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    Object.assign(job, updates);
    await job.save();

    const employee = await employeeModel.findOne({ user: req.user._id });

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE_JOB',
      entityType: 'JobPosting',
      performedBy: employee._id,
      entityId: job._id,
      oldData: job.toObject(),
      newData: updates
    });

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update job posting' });
  }
}

/**
 * Delete a job posting (HR/Admin only)
 */
export const deleteJob = async (req, res) => {
  try {
    const job = await JobPosting.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const employee = await employeeModel.findOne({ user: req.user._id });

    await AuditLog.create({
      user: req.user._id,
      action: 'DELETE_JOB',
      entityType: 'JobPosting',
      performedBy: employee._id,
      entityId: req.params.id,
      oldData: { title: job.title }
    });

    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job posting' });
  }
}

// ------------------- Applications -------------------

/**
 * Submit a job application (public)
 */
export const submitApplication = async (req, res) => {
  try {
    const { firstName, lastName, candidateEmail, resumeUrl } = req.body;
    const jobId = req.params.id;

    const job = await JobPosting.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ error: 'This job is not accepting applications' });

    // Check for duplicate application (same email + job)
    const existing = await Application.findOne({ jobPosting: jobId, candidateEmail });
    if (existing) return res.status(409).json({ error: 'You have already applied for this position' });

    const application = await Application.create({
      jobPosting: jobId,
      firstName,
      lastName,
      candidateEmail,
      resumeUrl,
      status: 'submitted',
      appliedDate: new Date()
    });

    // Notify HR (all HR managers) – optional
    const hrUsers = await Employee.find({ position: { $regex: 'HR', $options: 'i' } }).populate('user');
    const hrUserIds = hrUsers.map(emp => emp.user._id).filter(id => id);
    if (hrUserIds.length) {
      await notifyManyUsers(hrUserIds, 'in_app', 'New Job Application',
        `${firstName} ${lastName} applied for ${job.title}`, {
        relatedEntityType: 'Application',
        relatedEntityId: application._id
      });
    }
    const candidateUser = await User.findOne({ email: candidateEmail });

    await notifyUser(candidateUser._id, 'email', "RECRUITMENT", `Application ${application.status}`,
      `Your application for ${application.jobPosting.title} has been submitted and is currently ${application.status}.`, {
      relatedEntityType: 'Application',
      relatedEntityId: application._id
    });

    res.status(201).json({ message: 'Application submitted successfully', applicationId: application._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit application', error: err.message });
  }
}

/**
 * List applications (HR/Admin only) – with filtering
 */
export const listApplications = async (req, res) => {
  try {
    const { status, jobId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (jobId) filter.jobPosting = jobId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('jobPosting', 'title department')
        .populate('reviewedBy', 'firstName lastName')
        .sort({ appliedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments(filter)
    ]);

    res.json({
      applications,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
}

/**
 * Update application status (HR/Admin only) – e.g., shortlist, reject, hire
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    const validStatuses = ['submitted', 'shortlisted', 'interviewed', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id).populate('jobPosting');
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const employee = await employeeModel.findOne({ user: req.user._id });
    application.status = status;
    application.reviewedBy = employee?._id || null;
    application.reviewNote = reviewNote || application.reviewNote;
    await application.save();

    // Notify candidate (if email provided) – only for significant changes
    if (status === 'shortlisted' || status === 'rejected' || status === 'hired') {
      // In a real system, you'd send an email notification
      // For now, we create an in-app notification for the candidate (if they have an account)
      const candidateUser = await User.findOne({ email: application.candidateEmail });
      if (candidateUser) {
        await notifyUser(candidateUser._id, 'in_app', `Application ${status}`,
          `Your application for ${application.jobPosting.title} has been ${status}.`, {
          relatedEntityType: 'Application',
          relatedEntityId: application._id
        });

        await notifyUser(candidateUser._id, 'email', `Application ${status}`,
          `Your application for ${application.jobPosting.title} has been ${status}.`, {
          relatedEntityType: 'Application',
          relatedEntityId: application._id
        });
      }
    }

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE_APPLICATION_STATUS',
      entityType: 'Application',
      performedBy: employee?._id || null,
      entityId: application._id,
      newData: { status, reviewNote }
    });

    res.json({ message: `Application ${status}`, application });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application status' });
  }
}