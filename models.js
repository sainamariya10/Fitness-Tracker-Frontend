// const mongoose = require('mongoose');

// // User Schema
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   age: { type: Number, required: true },
//   gender: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['user', 'admin'], default: 'user' },
//   isBlocked: { type: Boolean, default: false },
//   following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   isBlocked: { type: Boolean, default: false },
//   role: { type: String, enum: ['user', 'admin'], default: 'user' },
//   goals: {
//     weightTarget: { type: Number, default: 0 },
//     dailyCalorieTarget: { type: Number, default: 2000 },
//     stepCountTarget: { type: Number, default: 10000 }
//   }
// }, { timestamps: true });


// // Workout Log Schema
// const workoutSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   exerciseType: { type: String, required: true },
//   duration: { type: Number, required: true }, // in minutes
//   caloriesBurned: { type: Number, required: true },
//   date: { type: Date, default: Date.now }
// });

// // Diet Log Schema
// const dietSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   foodItem: { type: String, required: true },
//   calories: { type: Number, required: true },
//   mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
//   date: { type: Date, default: Date.now }
// });

// // Social Post Schema
// const postSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   userName: { type: String, required: true },
//   content: { type: String, required: true },
//   likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   comments: [{
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     userName: { type: String },
//     text: { type: String },
//     createdAt: { type: Date, default: Date.now }
//    }]
//   }, { timestamps: true });

// module.exports = {
//   User: mongoose.model('User', userSchema),
//   Workout: mongoose.model('Workout', workoutSchema),
//   Diet: mongoose.model('Diet', dietSchema),
//   Post: mongoose.model('Post', postSchema)
// };






const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  gender: String,
  phone: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  goals: {
    weightTarget: Number,
    dailyCalorieTarget: Number,
    stepCountTarget: Number
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  exerciseType: String,
  duration: Number,
  caloriesBurned: Number,
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const dietSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  foodItem: String,
  calories: Number,
  mealType: String,
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  content: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  Workout: mongoose.model('Workout', workoutSchema),
  Diet: mongoose.model('Diet', dietSchema),
  Post: mongoose.model('Post', postSchema)
};