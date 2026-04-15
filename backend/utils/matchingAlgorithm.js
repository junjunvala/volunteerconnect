// utils/matchingAlgorithm.js
// ─────────────────────────────────────────────────────────────────────────────
//  VolunteerConnect AI - Smart Volunteer Matching Engine
//  
//  SCORING FORMULA (total = 100 points):
//  ┌──────────────────────────────┬────────┐
//  │ Component                    │ Weight │
//  ├──────────────────────────────┼────────┤
//  │ Skill Match Score            │  40%   │
//  │ Availability Match Score     │  20%   │
//  │ Distance Score               │  20%   │
//  │ Reliability Score            │  10%   │
//  │ Urgency Weight Bonus         │  10%   │
//  └──────────────────────────────┴────────┘
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Haversine formula: calculate distance in km between two lat/lng points
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) { return deg * (Math.PI / 180); }

/**
 * Calculate skill match score (0–100)
 * Percentage of required skills the volunteer has
 */
function skillMatchScore(requiredSkills, volunteerSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!volunteerSkills || volunteerSkills.length === 0) return 0;

  const matched = requiredSkills.filter(skill =>
    volunteerSkills.includes(skill)
  ).length;

  return (matched / requiredSkills.length) * 100;
}

/**
 * Calculate distance score (0–100)
 * Closer = higher score. Max useful range = 100km
 */
function distanceScore(taskLat, taskLng, volunteerLat, volunteerLng) {
  // If location not set, give neutral score
  if (!volunteerLat || !volunteerLng || !taskLat || !taskLng) return 50;

  const distKm = haversineDistance(taskLat, taskLng, volunteerLat, volunteerLng);

  // Score formula: 100 at 0km, 0 at 100km, linear
  const score = Math.max(0, 100 - distKm);
  return Math.min(100, score);
}

/**
 * Availability match score (0–100)
 * Check if volunteer's availability overlaps with task days
 */
function availabilityScore(taskDeadline, volunteerAvailability) {
  if (!volunteerAvailability || volunteerAvailability.length === 0) return 50;

  const taskDate = new Date(taskDeadline);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const taskDay  = dayNames[taskDate.getDay()];

  // Check if volunteer is available on task day or has general weekday/weekend availability
  const isWeekend  = taskDate.getDay() === 0 || taskDate.getDay() === 6;
  const isWeekday  = !isWeekend;

  const exactMatch    = volunteerAvailability.includes(taskDay);
  const weekendMatch  = isWeekend && volunteerAvailability.includes('Weekends');
  const weekdayMatch  = isWeekday && volunteerAvailability.includes('Weekdays');
  const generalMatch  = volunteerAvailability.length > 3; // broadly available

  if (exactMatch || weekendMatch || weekdayMatch) return 100;
  if (generalMatch) return 70;
  return 30;
}

/**
 * Urgency weight bonus (0–100)
 * High urgency tasks prioritize nearby + skilled volunteers more
 */
function urgencyBonus(urgencyLevel, skillScore, distScore) {
  const urgencyMultiplier = { High: 1.0, Medium: 0.6, Low: 0.3 };
  const multiplier = urgencyMultiplier[urgencyLevel] || 0.5;

  // For high urgency: boost the average of skill + distance
  return ((skillScore + distScore) / 2) * multiplier;
}

/**
 * MAIN FUNCTION: Calculate match scores for all volunteers against a task
 * Returns sorted array of { volunteer, scores, finalScore }
 */
function calculateMatchScores(task, volunteers) {
  if (!volunteers || volunteers.length === 0) return [];

  const results = volunteers.map(volunteer => {
    // 1. Skill match (40%)
    const skill = skillMatchScore(
      task.requiredSkills,
      volunteer.skills
    );

    // 2. Availability match (20%)
    const availability = availabilityScore(
      task.deadline,
      volunteer.availability
    );

    // 3. Distance score (20%)
    const distance = distanceScore(
      task.location.lat,
      task.location.lng,
      volunteer.location?.lat,
      volunteer.location?.lng
    );

    // 4. Reliability score (already 0–100, use directly) (10%)
    const reliability = volunteer.reliabilityScore || 80;

    // 5. Urgency bonus (10%)
    const urgency = urgencyBonus(task.urgencyLevel, skill, distance);

    // ── Final weighted score ──────────────────────────────────────────────
    const finalScore = Math.round(
      (skill        * 0.40) +
      (availability * 0.20) +
      (distance     * 0.20) +
      (reliability  * 0.10) +
      (urgency      * 0.10)
    );

    return {
      volunteer: {
        _id:              volunteer._id,
        name:             volunteer.name,
        email:            volunteer.email,
        phone:            volunteer.phone,
        skills:           volunteer.skills,
        location:         volunteer.location,
        reliabilityScore: volunteer.reliabilityScore,
        availability:     volunteer.availability,
      },
      scores: {
        skill:        Math.round(skill),
        availability: Math.round(availability),
        distance:     Math.round(distance),
        reliability:  Math.round(reliability),
        urgency:      Math.round(urgency),
      },
      finalScore,
    };
  });

  // Sort by final score descending
  return results.sort((a, b) => b.finalScore - a.finalScore);
}

/**
 * BONUS AI FEATURE: Predict urgency based on task description keywords
 * Rule-based NLP (no external API needed)
 */
function predictUrgency(description) {
  const text = description.toLowerCase();

  const highUrgencyKeywords = [
    'flood', 'earthquake', 'fire', 'emergency', 'disaster', 'urgent', 'critical',
    'immediate', 'sos', 'rescue', 'trapped', 'life', 'death', 'severe',
    'hospital', 'ambulance', 'crisis', 'evacuation',
  ];
  const mediumUrgencyKeywords = [
    'camp', 'relief', 'distribution', 'support', 'need', 'help', 'assist',
    'medical', 'food', 'shelter', 'supply', 'volunteer',
  ];

  const highMatches   = highUrgencyKeywords.filter(kw => text.includes(kw)).length;
  const mediumMatches = mediumUrgencyKeywords.filter(kw => text.includes(kw)).length;

  if (highMatches >= 2)   return { level: 'High',   confidence: Math.min(90, 60 + highMatches * 10) };
  if (highMatches === 1)  return { level: 'Medium',  confidence: 60 };
  if (mediumMatches >= 2) return { level: 'Medium',  confidence: Math.min(80, 50 + mediumMatches * 5) };
  return { level: 'Low', confidence: 50 };
}

/**
 * BONUS AI FEATURE: Suggest number of volunteers based on category + description
 */
function suggestVolunteerCount(category, description) {
  const suggestions = {
    'Disaster Relief':    { min: 10, max: 50, default: 20 },
    'Food Distribution':  { min: 5,  max: 30, default: 10 },
    'Medical Camp':       { min: 8,  max: 25, default: 12 },
    'Blood Donation':     { min: 3,  max: 15, default: 8  },
    'Education':          { min: 2,  max: 10, default: 5  },
    'Environmental':      { min: 5,  max: 40, default: 15 },
    'Animal Rescue':      { min: 3,  max: 10, default: 5  },
    'Community Support':  { min: 3,  max: 20, default: 8  },
    'Other':              { min: 2,  max: 15, default: 6  },
  };
  const range = suggestions[category] || suggestions['Other'];
  return range;
}

module.exports = {
  calculateMatchScores,
  predictUrgency,
  suggestVolunteerCount,
  haversineDistance,
};
