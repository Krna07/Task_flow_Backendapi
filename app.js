const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

require('dotenv').config();
const scheduleEmailReminder = require("./emailReminder"); 

const { User, SignupUser,adminData } = require('./usermodel');
console.log({ User, SignupUser,adminData });



app.get("/", (req, res) => {
  res.send("hey");
});

app.post("/signup", async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    let new_User = await SignupUser.create({
      name: username,
      email: email,
      password: password
    });
    console.log("New signup:", new_User);
    res.send(new_User)
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Error during signup.");
  }
});

app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // Check if user exists
    const user = await SignupUser.findOne({ email: email });
    console.log(user)

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).send("Invalid password");
    }

    // Login success
    // res.status(200).send("Login successful!");
  res.status(200).json({ 
  message: "Login successful!", 
  userId: user._id,
  taskArray: user.taskArray ,
  name:user.name,
  email:user.email
  });

    
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Error during login.");
  }
});


// app.post("/user/:id", async (req, res) => {
//   const { id } = req.params;
//   const { taskName, category } = req.body;

//   try {
//     // 1️⃣ Find the user by ID
//     const user = await SignupUser.findById(id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     console.log(user)
//     // 2️⃣ Push new task into user's taskArray
//     user.taskArray.push({ taskName, category });

//     // 3️⃣ Save the updated user document
//     await user.save();

//     // 4️⃣ Respond with success message and updated user data
//     res.status(200).json({ message: "Task added successfully", user });
    
//   } catch (err) {
//     console.error("Error adding task:", err);
//     res.status(500).json({ error: "Error adding task" });
//   }
// });

app.post("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { taskName, category, taskTime } = req.body;

  try {
    const user = await SignupUser.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.taskArray.push({ taskName, category, taskTime });
    await user.save();

    // Schedule the email reminder here
    scheduleEmailReminder(user, taskName, taskTime);

    res.status(200).json({ message: "Task added successfully", user });
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(500).json({ error: "Error adding task" });
  }
});




app.post("/read",async(req,res)=>{

  const userId=req.body.userId;
  const user = await SignupUser.findOne(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(200).json({ message: "User found", taskArray:user.taskArray });
})

app.post("/delete", async (req, res) => {
  try {
    const { userId, taskName } = req.body;

    // Find user by id
    const user = await SignupUser.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the task with matching taskName from taskArray
    user.taskArray.pull({ taskName: taskName });

    // Save updated user
    await user.save();

    res.status(200).json({ message: "Task deleted successfully", updatedUser: user });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Error deleting task" });
  }
});


  // username : String,
  // password : String,
  // Assignto : String,
  // Messages : String,
  // taskAssignArray:[
  //   {
  //     taskname:String,
  //   }
  // ]
app.post("/admin",async (req,res)=>{
  const {username , password } = req.body;
  const user = await adminData.findOne({username:username,password:password});
  if(user){
    res.status(200).json({ message: "Admin_found" ,data:user});
  }else{
    res.status(404).json({ message: "Admin not found" });
  }
  

})


app.post("/adminsignup",(req,res)=>{
  const {username ,email, password } = req.body;
  const user = adminData.create({
    username:username,
    email:email,
    password:password
  
  })
  res.status(200).json({ message: "Admin created successfully" ,data:user});


})



app.post("/admindash/:adminId", async (req, res) => {
  const { adminId } = req.params;
  const { taskname, assignTo } = req.body;

  try {

     const user = await SignupUser.findOne({ email: assignTo });
    if (!user) {
      return res.status(404).json({ message: "Assigned user email not found in registered users" });
    }
    const admin = await adminData.findOne({_id:adminId});
    console.log(admin)
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
   
        admin.taskAssignArray.push({ 
        taskname: taskname,
        Assignto:assignTo
        });
        await admin.save();
      

    res.status(200).json({
      message: `Task assigned to ${assignTo}`,
      data: admin,
    });
  } catch (err) {
    console.error("Error in assigning task:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});




app.post("/admin-info", async (req, res) => {
  const { adminId } = req.body;
  console.log("Incoming request:", req.body);
  try{
    const adminInfo = await adminData.findOne({_id:adminId});  
    console.log("AdminInfo",adminInfo)
    res.status(200).json({ message: "Admin info retrieved", data: adminInfo });
  }
  catch(err){
    console.error("❌ Error in /admin-info:", err);
  }

})

app.post("/notifications", async (req, res) => {
  const { email } = req.body;

  try {
    console.log("Incoming request:", req.body);
    console.log("Email received:", email);

    const taskDocs = await adminData.find({ "taskAssignArray.Assignto": email });
    console.log("Matching Admin Docs:", taskDocs);

    const tasknames = [];

    // Loop through and collect tasks assigned to the user
    taskDocs.forEach(doc => {
      doc.taskAssignArray.forEach(task => {
        if (task.Assignto === email) {
          tasknames.push({
            ...task,
            assignedBy: doc.username || doc.name || doc.email ,
            taskname:task.taskname
          });
        }
      });
    });

    res.status(200).json({ message: "Tasks Found", data: tasknames });
  } catch (err) {
    console.error("Error in /notifications:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});


app.listen(port, () => {
  console.log(`🚀 Connected`);
});




