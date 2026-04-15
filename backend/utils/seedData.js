// utils/seedData.js - Insert demo data for hackathon testing
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Task     = require('../models/Task');
const Assignment = require('../models/Assignment');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteerconnect';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Task.deleteMany({});
  await Assignment.deleteMany({});
  console.log('Cleared existing data');

  // ── Create Admin ───────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Priya Sharma',
    email: 'admin@demo.com',
    password: 'demo1234',
    role: 'admin',
    organizationName: 'HelpIndia NGO',
    phone: '9876543210',
  });
  console.log('Admin created: admin@demo.com / demo1234');

  // ── Create Volunteers ──────────────────────────────────────────────────────
  const volunteerData = [
    {
      name: 'Rahul Mehta',
      email: 'rahul@demo.com', password: 'demo1234',
      skills: ['First Aid', 'Medical', 'Driving'],
      availability: ['Monday', 'Wednesday', 'Friday', 'Morning'],
      location: { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
      reliabilityScore: 92, totalAssigned: 10, totalCompleted: 9, totalAccepted: 10,
    },
    {
      name: 'Anjali Patel',
      email: 'anjali@demo.com', password: 'demo1234',
      skills: ['Cooking', 'Logistics', 'Communication'],
      availability: ['Saturday', 'Sunday', 'Weekends', 'Morning', 'Afternoon'],
      location: { city: 'Surat', lat: 21.1702, lng: 72.8311 },
      reliabilityScore: 85, totalAssigned: 8, totalCompleted: 7, totalAccepted: 8,
    },
    {
      name: 'Vikram Singh',
      email: 'vikram@demo.com', password: 'demo1234',
      skills: ['Rescue', 'Physical Labor', 'Driving', 'First Aid'],
      availability: ['Monday', 'Tuesday', 'Thursday', 'Weekdays'],
      location: { city: 'Vadodara', lat: 22.3072, lng: 73.1812 },
      reliabilityScore: 78, totalAssigned: 6, totalCompleted: 5, totalAccepted: 6,
    },
    {
      name: 'Meera Nair',
      email: 'meera@demo.com', password: 'demo1234',
      skills: ['Teaching', 'Counseling', 'Communication'],
      availability: ['Wednesday', 'Friday', 'Saturday', 'Morning', 'Afternoon'],
      location: { city: 'Ahmedabad', lat: 23.0358, lng: 72.5973 },
      reliabilityScore: 95, totalAssigned: 12, totalCompleted: 12, totalAccepted: 12,
    },
    {
      name: 'Arjun Verma',
      email: 'arjun@demo.com', password: 'demo1234',
      skills: ['IT Support', 'Communication', 'Logistics'],
      availability: ['Weekdays', 'Morning', 'Afternoon', 'Evening'],
      location: { city: 'Rajkot', lat: 22.3039, lng: 70.8022 },
      reliabilityScore: 70, totalAssigned: 5, totalCompleted: 4, totalAccepted: 5,
    },
    {
      name: 'Deepa Joshi',
      email: 'deepa@demo.com', password: 'demo1234',
      skills: ['Medical', 'First Aid', 'Counseling'],
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      location: { city: 'Gandhinagar', lat: 23.2156, lng: 72.6369 },
      reliabilityScore: 88, totalAssigned: 9, totalCompleted: 8, totalAccepted: 9,
    },
  ];

  const volunteers = await User.create(volunteerData);
  console.log(`${volunteers.length} volunteers created`);

  // ── Create Tasks ───────────────────────────────────────────────────────────
  const taskData = [
    {
      title: 'Flood Relief Food Distribution - Vadodara',
      description: 'Emergency flood relief operation. Immediate help needed for food distribution to 500+ affected families in low-lying areas. Rescue teams need support.',
      location: { address: 'Vadodara Flood Zone', city: 'Vadodara', lat: 22.3072, lng: 73.1812 },
      requiredSkills: ['Cooking', 'Logistics', 'Physical Labor', 'Driving'],
      volunteersNeeded: 15,
      urgencyLevel: 'High',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      category: 'Disaster Relief',
      createdBy: admin._id,
      status: 'Active',
    },
    {
      title: 'Blood Donation Camp - Ahmedabad',
      description: 'Monthly blood donation drive at Civil Hospital. Volunteers needed to manage registration, guide donors, and assist medical staff.',
      location: { address: 'Civil Hospital', city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
      requiredSkills: ['Medical', 'First Aid', 'Communication'],
      volunteersNeeded: 8,
      urgencyLevel: 'Medium',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      category: 'Blood Donation',
      createdBy: admin._id,
      status: 'Open',
    },
    {
      title: 'Rural Education Drive - Gandhinagar',
      description: 'Teaching basic literacy and digital skills to underprivileged children in villages near Gandhinagar. Weekend program.',
      location: { address: 'Village School, Gandhinagar District', city: 'Gandhinagar', lat: 23.2156, lng: 72.6369 },
      requiredSkills: ['Teaching', 'Communication', 'IT Support'],
      volunteersNeeded: 6,
      urgencyLevel: 'Low',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      category: 'Education',
      createdBy: admin._id,
      status: 'Open',
    },
    {
      title: 'Medical Camp - Surat Slum Area',
      description: 'Free medical checkup and medicines distribution in Surat slum. Doctors and medical volunteers needed urgently.',
      location: { address: 'Udhna Slum Area', city: 'Surat', lat: 21.1702, lng: 72.8311 },
      requiredSkills: ['Medical', 'First Aid', 'Counseling'],
      volunteersNeeded: 10,
      urgencyLevel: 'High',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      category: 'Medical Camp',
      createdBy: admin._id,
      status: 'Open',
    },
    {
      title: 'Tree Plantation Drive - Rajkot',
      description: 'Community tree plantation drive. Plant 1000 trees in the city outskirts. Physical work involved.',
      location: { address: 'City Outskirts', city: 'Rajkot', lat: 22.3039, lng: 70.8022 },
      requiredSkills: ['Physical Labor', 'Logistics'],
      volunteersNeeded: 25,
      urgencyLevel: 'Low',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      category: 'Environmental',
      createdBy: admin._id,
      status: 'Open',
    },
  ];

  const tasks = await Task.create(taskData);
  console.log(`${tasks.length} tasks created`);

  // ── Create a sample assignment ─────────────────────────────────────────────
  await Assignment.create({
    task: tasks[0]._id,
    volunteer: volunteers[0]._id,
    status: 'Accepted',
    matchScore: 88,
    acceptedAt: new Date(),
    responseTime: 15,
  });
  await Assignment.create({
    task: tasks[0]._id,
    volunteer: volunteers[2]._id,
    status: 'In Progress',
    matchScore: 82,
    acceptedAt: new Date(Date.now() - 3600000),
    responseTime: 25,
  });
  console.log('Sample assignments created');

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('Admin login:     admin@demo.com / demo1234');
  console.log('Volunteer login: rahul@demo.com / demo1234');
  console.log('─────────────────────────────────────────\n');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
