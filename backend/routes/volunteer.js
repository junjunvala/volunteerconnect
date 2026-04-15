// routes/volunteer.js - Volunteer profile and task management
const express      = require('express');
const router       = express.Router();
const User         = require('../models/User');
const Task         = require('../models/Task');
const Assignment   = require('../models/Assignment');
const Notification = require('../models/Notification');
const { protect, volunteerOnly } = require('../middleware/auth');

// All routes require login as volunteer
router.use(protect);

// ─── GET /api/volunteer/profile ───────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/volunteer/profile ───────────────────────────────────────────────
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, skills, availability, location, isAvailable } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, skills, availability, location, isAvailable },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/volunteer/tasks - all assigned tasks for this volunteer ─────────
router.get('/tasks', async (req, res) => {
  try {
    const assignments = await Assignment.find({ volunteer: req.user._id })
      .populate('task')
      .sort({ assignedAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/volunteer/task/:assignmentId/status ─────────────────────────────
router.put('/task/:assignmentId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Accepted', 'Rejected', 'In Progress', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const assignment = await Assignment.findOne({
      _id: req.params.assignmentId,
      volunteer: req.user._id,
    });

    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    assignment.status = status;
    await assignment.save();

    // Update volunteer stats
    const volunteer = await User.findById(req.user._id);
    if (status === 'Accepted') {
      volunteer.totalAccepted += 1;
    }
    if (status === 'Completed') {
      volunteer.totalCompleted += 1;
    }
    volunteer.updateReliabilityScore();
    await volunteer.save();

    // If all volunteers completed → mark task completed
    if (status === 'Completed') {
      const task = await Task.findById(assignment.task);
      const allAssignments = await Assignment.find({ task: task._id });
      const allDone = allAssignments.every(a => a.status === 'Completed');
      if (allDone) {
        task.status = 'Completed';
        await task.save();
      }
    }

    res.json({ message: `Status updated to ${status}`, assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/volunteer/notifications ─────────────────────────────────────────
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/volunteer/notifications/read ────────────────────────────────────
router.put('/notifications/read', async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/volunteer/browse - browse open tasks ────────────────────────────
router.get('/browse', async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'Open' })
      .populate('createdBy', 'name organizationName')
      .sort({ urgencyLevel: -1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
