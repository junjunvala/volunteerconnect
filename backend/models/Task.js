// models/Task.js - Task / Volunteer Request model
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  location: {
    address: { type: String, default: '' },
    city:    { type: String, default: '' },
    lat:     { type: Number, required: true },
    lng:     { type: Number, required: true },
  },
  requiredSkills: [{
    type: String,
    enum: [
      'First Aid', 'Medical', 'Cooking', 'Driving', 'Teaching',
      'Construction', 'IT Support', 'Logistics', 'Communication',
      'Physical Labor', 'Rescue', 'Counseling', 'Fundraising', 'Legal',
    ],
  }],
  volunteersNeeded: { type: Number, required: true, min: 1 },
  urgencyLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Open', 'Active', 'Completed', 'Cancelled'],
    default: 'Open',
  },

  // ── Admin who created this ─────────────────────────────────────────────────
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // ── Assigned volunteers list ───────────────────────────────────────────────
  assignedVolunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  category: {
    type: String,
    enum: ['Disaster Relief', 'Food Distribution', 'Medical Camp', 'Blood Donation',
           'Education', 'Environmental', 'Animal Rescue', 'Community Support', 'Other'],
    default: 'Other',
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

taskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
