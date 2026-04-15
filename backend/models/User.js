// models/User.js - Unified user model for volunteers and admins
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false, // never return password by default
  },
  role: {
    type: String,
    enum: ['volunteer', 'admin'],
    default: 'volunteer',
  },
  phone: { type: String, trim: true },

  // ── Volunteer-specific fields ──────────────────────────────────────────────
  skills: [{
    type: String,
    enum: [
      'First Aid', 'Medical', 'Cooking', 'Driving', 'Teaching',
      'Construction', 'IT Support', 'Logistics', 'Communication',
      'Physical Labor', 'Rescue', 'Counseling', 'Fundraising', 'Legal',
    ],
  }],
  availability: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
           'Morning', 'Afternoon', 'Evening', 'Night', 'Weekdays', 'Weekends'],
  }],
  location: {
    city: { type: String, default: '' },
    lat:  { type: Number, default: 0 },
    lng:  { type: Number, default: 0 },
  },
  isAvailable: { type: Boolean, default: true },

  // ── Reliability Score (AI feature) ────────────────────────────────────────
  reliabilityScore: { type: Number, default: 80, min: 0, max: 100 },
  totalAssigned:    { type: Number, default: 0 },
  totalCompleted:   { type: Number, default: 0 },
  totalAccepted:    { type: Number, default: 0 },

  // ── Admin/NGO-specific fields ──────────────────────────────────────────────
  organizationName: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate and update reliability score
userSchema.methods.updateReliabilityScore = function () {
  if (this.totalAssigned === 0) return;
  const acceptRate     = (this.totalAccepted  / this.totalAssigned) * 100;
  const completionRate = (this.totalCompleted / this.totalAssigned) * 100;
  // Weighted: 40% accept, 60% completion
  this.reliabilityScore = Math.round((acceptRate * 0.4) + (completionRate * 0.6));
};

module.exports = mongoose.model('User', userSchema);
