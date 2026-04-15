// routes/admin.js - Admin task management & volunteer assignment
const express      = require('express');
const router       = express.Router();
const Task         = require('../models/Task');
const User         = require('../models/User');
const Assignment   = require('../models/Assignment');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');
const { calculateMatchScores } = require('../utils/matchingAlgorithm');
const { sendAssignmentEmail }  = require('../utils/emailService');

router.use(protect, adminOnly);

// ─── POST /api/admin/task/create ──────────────────────────────────────────────
router.post('/task/create', async (req, res) => {
  try {
    const {
      title, description, location, requiredSkills,
      volunteersNeeded, urgencyLevel, deadline, category,
    } = req.body;

    const task = await Task.create({
      title, description, location, requiredSkills,
      volunteersNeeded, urgencyLevel, deadline, category,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/admin/tasks ─────────────────────────────────────────────────────
router.get('/tasks', async (req, res) => {
  try {
    const { status, urgency } = req.query;
    const filter = { createdBy: req.user._id };
    if (status)  filter.status = status;
    if (urgency) filter.urgencyLevel = urgency;

    const tasks = await Task.find(filter)
      .populate('assignedVolunteers', 'name email reliabilityScore')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/admin/task/:id ──────────────────────────────────────────────────
router.get('/task/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedVolunteers', 'name email phone skills location reliabilityScore')
      .populate('createdBy', 'name organizationName');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const assignments = await Assignment.find({ task: task._id })
      .populate('volunteer', 'name email phone skills location reliabilityScore');

    res.json({ task, assignments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/admin/task/:id/recommendations ──────────────────────────────────
// Returns top N volunteers ranked by matching score
router.get('/task/:id/recommendations', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Get all available volunteers (exclude already assigned)
    const alreadyAssigned = task.assignedVolunteers.map(v => v.toString());
    const volunteers = await User.find({
      role: 'volunteer',
      isAvailable: true,
      _id: { $nin: alreadyAssigned },
    });

    // Run matching algorithm
    const ranked = calculateMatchScores(task, volunteers);

    res.json(ranked.slice(0, 20)); // Return top 20
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/admin/task/:id/assign ─────────────────────────────────────────
// Assign specific volunteers OR auto-assign top matches
router.post('/task/:id/assign', async (req, res) => {
  try {
    const { volunteerIds, autoAssign } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    let idsToAssign = volunteerIds || [];

    // Auto-assign: pick top N from matching algorithm
    if (autoAssign) {
      const volunteers = await User.find({ role: 'volunteer', isAvailable: true });
      const ranked     = calculateMatchScores(task, volunteers);
      const needed     = task.volunteersNeeded - task.assignedVolunteers.length;
      idsToAssign      = ranked.slice(0, needed).map(v => v.volunteer._id.toString());
    }

    if (!idsToAssign.length) {
      return res.status(400).json({ message: 'No volunteers to assign' });
    }

    const newAssignments = [];

    for (const vid of idsToAssign) {
      // Avoid duplicate assignments
      const exists = await Assignment.findOne({ task: task._id, volunteer: vid });
      if (exists) continue;

      // Create assignment
      const assignment = await Assignment.create({
        task: task._id,
        volunteer: vid,
        matchScore: 0,
      });
      newAssignments.push(assignment);

      // Add to task's assigned list
      task.assignedVolunteers.push(vid);

      // Create in-app notification
      await Notification.create({
        recipient: vid,
        type: 'task_assigned',
        title: 'New Task Assigned!',
        message: `You have been assigned to: "${task.title}" — ${task.location.city || task.location.address}`,
        taskId: task._id,
      });

      // Send email notification (non-blocking)
      try {
        const volunteer = await User.findById(vid);
        sendAssignmentEmail(volunteer.email, volunteer.name, task);
      } catch (emailErr) {
        console.log('Email not sent (optional):', emailErr.message);
      }

      // Update volunteer stats
      await User.findByIdAndUpdate(vid, { $inc: { totalAssigned: 1 } });
    }

    // Update task status to Active if volunteers assigned
    if (task.assignedVolunteers.length > 0) task.status = 'Active';
    await task.save();

    res.json({
      message: `${newAssignments.length} volunteer(s) assigned successfully`,
      task,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/admin/task/:id/status ──────────────────────────────────────────
router.put('/task/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ message: 'Task status updated', task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/admin/volunteers - list all volunteers ─────────────────────────
router.get('/volunteers', async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' })
      .select('-password')
      .sort({ reliabilityScore: -1 });
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
