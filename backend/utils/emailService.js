// utils/emailService.js - Nodemailer email notifications (optional)
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAssignmentEmail = async (toEmail, volunteerName, task) => {
  if (!process.env.EMAIL_USER) return; // Skip if not configured

  const mailOptions = {
    from: `VolunteerConnect <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `New Task Assigned: ${task.title}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <div style="background:#2563EB;color:white;padding:20px;border-radius:8px 8px 0 0">
          <h2>🤝 VolunteerConnect AI</h2>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <h3>Hello ${volunteerName},</h3>
          <p>You have been assigned to a new volunteer task!</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0">
            <h4 style="margin:0 0 8px 0;color:#1f2937">${task.title}</h4>
            <p style="margin:4px 0;color:#6b7280">📍 ${task.location.city || task.location.address}</p>
            <p style="margin:4px 0;color:#6b7280">⏰ Deadline: ${new Date(task.deadline).toLocaleDateString()}</p>
            <span style="background:${task.urgencyLevel === 'High' ? '#fee2e2' : task.urgencyLevel === 'Medium' ? '#fef9c3' : '#dcfce7'};
              color:${task.urgencyLevel === 'High' ? '#991b1b' : task.urgencyLevel === 'Medium' ? '#854d0e' : '#166534'};
              padding:4px 12px;border-radius:9999px;font-size:14px">${task.urgencyLevel} Priority</span>
          </div>
          <p>${task.description}</p>
          <p>Please log in to your dashboard to accept or reject this assignment.</p>
          <a href="${process.env.FRONTEND_URL}/volunteer/tasks"
             style="background:#2563EB;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
            View Task →
          </a>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendAssignmentEmail };
