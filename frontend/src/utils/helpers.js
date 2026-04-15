// src/utils/helpers.js

export const urgencyColor = (level) => {
  if (level === 'High')   return 'bg-red-100 text-red-700 border border-red-200';
  if (level === 'Medium') return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  return 'bg-green-100 text-green-700 border border-green-200';
};

export const urgencyDot = (level) => {
  if (level === 'High')   return 'bg-red-500';
  if (level === 'Medium') return 'bg-yellow-500';
  return 'bg-green-500';
};

export const statusColor = (status) => {
  const map = {
    Open:        'bg-blue-100 text-blue-700',
    Active:      'bg-indigo-100 text-indigo-700',
    Completed:   'bg-green-100 text-green-700',
    Cancelled:   'bg-gray-100 text-gray-600',
    Pending:     'bg-yellow-100 text-yellow-700',
    Accepted:    'bg-green-100 text-green-700',
    Rejected:    'bg-red-100 text-red-700',
    'In Progress': 'bg-blue-100 text-blue-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
};

export const scoreColor = (score) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-500';
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return 'just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
};

export const SKILLS = [
  'First Aid', 'Medical', 'Cooking', 'Driving', 'Teaching',
  'Construction', 'IT Support', 'Logistics', 'Communication',
  'Physical Labor', 'Rescue', 'Counseling', 'Fundraising', 'Legal',
];

export const AVAILABILITY_OPTIONS = [
  'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday',
  'Morning','Afternoon','Evening','Weekdays','Weekends',
];

export const CATEGORIES = [
  'Disaster Relief','Food Distribution','Medical Camp','Blood Donation',
  'Education','Environmental','Animal Rescue','Community Support','Other',
];
