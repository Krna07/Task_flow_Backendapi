const nodemailer = require("nodemailer");
const schedule = require("node-schedule");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password
  },
});

function scheduleEmailReminder(user, taskName, taskTime) {
  const reminderDate = new Date(taskTime);

  // Make sure the date is in the future
  if (reminderDate <= new Date()) return;

  schedule.scheduleJob(reminderDate, async () => {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Reminder: Task "${taskName}"`,
        text: `Hello ${user.name},\n\nThis is a reminder for your task: "${taskName}" scheduled now.\n\nRegards,\nTaskFlow`,
      });
      console.log("Email sent:", info.response);
    } catch (err) {
      console.error("Error sending email:", err);
    }
  });

  console.log(`Scheduled email for ${user.email} at ${reminderDate}`);
}

module.exports = scheduleEmailReminder;
