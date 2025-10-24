const mongoose = require('mongoose');
const { boolean } = require('webidl-conversions');

mongoose.connect("mongodb+srv://Tushar_110704:2dc1pkOsEx7yJyXz@cluster0.drxa4k1.mongodb.net/Task?retryWrites=true&w=majority&appName=Cluster0")

const userSchema = mongoose.Schema({
  email:String,
  password:String
})
const signupSchema = mongoose.Schema({
  name:String,
  email:String,
  password:String,

taskArray: [
  {
    taskName: String,
    category: String,
    taskTime: Date // new field
  }
]

})

const adminSchema = mongoose.Schema({
  username : String,
  email: String,
  password : String,
  Messages : String,
  taskAssignArray:[
    {
      taskname:String,
      Assignto : String,
    }
  ]
})


// const adminSchema = mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true, // ensures no duplicate emails
//     trim: true,
//     lowercase: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   Assignto: {
//     type: String,
//     default: ''
//   },
//   Messages: {
//     type: String,
//     default: ''
//   },
//   taskAssignArray: [
//     {
//       taskname: {
//         type: String,
//         required: true
//       }
//     }
//   ]
// });




const User = mongoose.model("user", userSchema);
const SignupUser = mongoose.model("signupUser", signupSchema);
const adminData = mongoose.model("adminData", adminSchema);


module.exports = {
  User,
  SignupUser,
  adminData
};