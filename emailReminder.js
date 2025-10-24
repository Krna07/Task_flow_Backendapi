// emailReminder.js
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP provider
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // app password
  }
});

function scheduleEmailReminder(user, taskName, taskTime) {
  const reminderDate = new Date(taskTime);

  // Make sure the date is in the future
  if (reminderDate <= new Date()) return;

  // Convert to cron format: min hour day month *
  const cronTime = `${reminderDate.getMinutes()} ${reminderDate.getHours()} ${reminderDate.getDate()} ${reminderDate.getMonth() + 1} *`;

  cron.schedule(cronTime, () => {
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Reminder: Task "${taskName}"`,
      text: `Hello ${user.name},\n\nThis is a reminder for your task: "${taskName}" scheduled now.\n\nRegards,\nTaskFlow`
    })
    .then(info => console.log("Email sent:", info.response))
    .catch(err => console.error("Error sending email:", err));
  });
}

module.exports = scheduleEmailReminder;
