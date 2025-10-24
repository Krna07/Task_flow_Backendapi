const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const SignupUser = require("./usermodel").SignupUser;

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});



/**
 * Schedule an email for a single task
 * @param {Object} user - MongoDB user object
 * @param {String} taskName - Task title
 * @param {Date|String} taskTime - Task scheduled time
 */
function scheduleEmailReminder(user, taskName, taskTime) {
  const reminderDate = new Date(taskTime);

  // Prevent scheduling past tasks
  if (reminderDate <= new Date()) return;

  schedule.scheduleJob(reminderDate, async () => {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `⏰ Reminder: Task "${taskName}"`,
        html: `
          <div style="font-family: Arial, sans-serif; text-align:center; background: #f0f4ff; padding: 20px; border-radius: 12px;">
            <h2 style="color:#1e3a8a;">Task Reminder</h2>
            <p style="font-size:16px;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size:16px;">This is a friendly reminder for your task:</p>
            <h3 style="color:#2563eb; margin:10px 0;">"${taskName}"</h3>
            <p style="font-size:14px; color:#555;">Scheduled at: ${reminderDate.toLocaleString()}</p>
            <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;" />
            <p style="font-size:14px; color:#888;">TaskFlow Reminder System</p>
          </div>
        `,
      });
      console.log(`✅ Email sent for "${taskName}" to ${user.email}`);
    } catch (err) {
      console.error("❌ Error sending email:", err);
    }
  });

  console.log(`📅 Scheduled email for ${user.email} at ${reminderDate}`);
}

/**
 * Reschedule all future tasks on server startup
 * Call this function once in your `server.js` after connecting to MongoDB
 */
async function rescheduleAllTasks() {
  try {
    const users = await SignupUser.find({ "taskArray.taskTime": { $gt: new Date() } });

    users.forEach((user) => {
      user.taskArray.forEach((task) => {
        if (new Date(task.taskTime) > new Date()) {
          scheduleEmailReminder(user, task.taskName, task.taskTime);
        }
      });
    });

    console.log("🔄 All future tasks rescheduled on server startup.");
  } catch (err) {
    console.error("❌ Error rescheduling tasks:", err);
  }
}

module.exports = {
  scheduleEmailReminder,
  rescheduleAllTasks,
};
