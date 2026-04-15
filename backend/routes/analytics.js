// routes/analytics.js - Admin analytics dashboard data
const express    = require('express');
const router     = express.Router();
const Task       = require('../models/Task');
const User       = require('../models/User');
const Assignment = require('../models/Assignment');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// ─── GET /api/analytics/overview ─────────────────────────────────────────────
router.get('/overview', async (req, res) => {
  try {
    const adminId = req.user._id;

    const [
      totalTasks,
      completedTasks,
      activeTasks,
      openTasks,
      highUrgencyTasks,
      totalVolunteers,
      activeVolunteers,
      totalAssignments,
      completedAssignments,
    ] = await Promise.all([
      Task.countDocuments({ createdBy: adminId }),
      Task.countDocuments({ createdBy: adminId, status: 'Completed' }),
      Task.countDocuments({ createdBy: adminId, status: 'Active' }),
      Task.countDocuments({ createdBy: adminId, status: 'Open' }),
      Task.countDocuments({ createdBy: adminId, urgencyLevel: 'High', status: { $ne: 'Completed' } }),
      User.countDocuments({ role: 'volunteer' }),
      User.countDocuments({ role: 'volunteer', isAvailable: true }),
      Assignment.countDocuments(),
      Assignment.countDocuments({ status: 'Completed' }),
    ]);

    // Tasks by urgency
    const urgencyBreakdown = await Task.aggregate([
      { $match: { createdBy: adminId } },
      { $group: { _id: '$urgencyLevel', count: { $sum: 1 } } },
    ]);

    // Tasks by category
    const categoryBreakdown = await Task.aggregate([
      { $match: { createdBy: adminId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Recent tasks (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentTasks = await Task.find({ createdBy: adminId, createdAt: { $gte: weekAgo } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status urgencyLevel createdAt');

    // Top volunteers by reliability
    const topVolunteers = await User.find({ role: 'volunteer' })
      .sort({ reliabilityScore: -1, totalCompleted: -1 })
      .limit(5)
      .select('name reliabilityScore totalCompleted totalAssigned skills');

    // Average response time from assignments
    const avgResponseTime = await Assignment.aggregate([
      { $match: { responseTime: { $exists: true, $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$responseTime' } } },
    ]);

    res.json({
      stats: {
        totalTasks,
        completedTasks,
        activeTasks,
        openTasks,
        highUrgencyTasks,
        totalVolunteers,
        activeVolunteers,
        totalAssignments,
        completedAssignments,
        completionRate: totalAssignments > 0
          ? Math.round((completedAssignments / totalAssignments) * 100)
          : 0,
        avgResponseTime: avgResponseTime[0]?.avg
          ? Math.round(avgResponseTime[0].avg)
          : 0,
      },
      urgencyBreakdown,
      categoryBreakdown,
      recentTasks,
      topVolunteers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
