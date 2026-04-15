// routes/match.js - Matching API endpoint
const express = require('express');
const router  = express.Router();
const Task    = require('../models/Task');
const User    = require('../models/User');
const { protect }          = require('../middleware/auth');
const { calculateMatchScores, predictUrgency, suggestVolunteerCount } = require('../utils/matchingAlgorithm');

// ─── GET /api/match/:taskId - Get ranked volunteer recommendations ─────────────
router.get('/:taskId', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const volunteers = await User.find({ role: 'volunteer', isAvailable: true });
    const ranked = calculateMatchScores(task, volunteers);

    res.json({
      taskId: task._id,
      taskTitle: task.title,
      volunteersNeeded: task.volunteersNeeded,
      totalCandidates: volunteers.length,
      recommendations: ranked.slice(0, 15),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/match/predict-urgency - AI urgency prediction ─────────────────
router.post('/predict-urgency', protect, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ message: 'Description required' });
    const result = predictUrgency(description);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/match/suggest-count - AI volunteer count suggestion ─────────────
router.post('/suggest-count', protect, async (req, res) => {
  try {
    const { category, description } = req.body;
    const result = suggestVolunteerCount(category, description);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
