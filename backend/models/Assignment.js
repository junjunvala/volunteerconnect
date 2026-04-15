// models/Assignment.js - Links tasks to volunteers with status tracking
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  matchScore: { type: Number, default: 0 }, // Score from matching algorithm

  assignedAt:   { type: Date, default: Date.now },
  acceptedAt:   { type: Date },
  completedAt:  { type: Date },
  responseTime: { type: Number }, // minutes to respond
});

// Auto-set timestamps on status change
assignmentSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'Accepted' && !this.acceptedAt) {
      this.acceptedAt = new Date();
      // Calculate response time in minutes
      this.responseTime = Math.round((this.acceptedAt - this.assignedAt) / 60000);
    }
    if (this.status === 'Completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);
