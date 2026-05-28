require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==========================================
// SCHEMAS (Inline - No External Models File)
// ==========================================

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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseType: { type: String, required: true },
  duration: { type: Number, required: true },
  caloriesBurned: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const dietSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodItem: { type: String, required: true },
  calories: { type: Number, required: true },
  mealType: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Create models
const User = mongoose.model('User', userSchema);
const Workout = mongoose.model('Workout', workoutSchema);
const Diet = mongoose.model('Diet', dietSchema);
const Post = mongoose.model('Post', postSchema);

// ==========================================
// MIDDLEWARE (Inline - No External Middleware File)
// ==========================================

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ==========================================
// MONGODB CONNECTION - WITH RETRY LOGIC
// ==========================================

let isMongoConnected = false;

const connectMongoDB = async () => {
  try {
    console.log('🔄 Attempting MongoDB connection...');
    console.log('📌 URI:', process.env.MONGO_URI ? '✅ Configured' : '❌ NOT SET');
    
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
    });

    isMongoConnected = true;
    console.log('✅ MongoDB Connected Successfully!');

    // Create admin if doesn't exist
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await User.create({
        name: 'System Admin',
        age: 30,
        gender: 'Male',
        email: process.env.ADMIN_EMAIL,
        phone: '0000000000',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin Account Created');
    } else {
      console.log('✅ Admin Account Already Exists');
    }
  } catch (error) {
    isMongoConnected = false;
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(connectMongoDB, 5000);
  }
};

// Connect to MongoDB
connectMongoDB();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==========================================
// HEALTH CHECK ENDPOINTS
// ==========================================

app.get('/api/data', (req, res) => {
  res.json({
    message: "✅ Successfully connected to the fitness tracker backend!",
    mongoConnected: isMongoConnected,
    timestamp: new Date()
  });
});

app.get('/api/debug/status', async (req, res) => {
  try {
    const adminUser = await User.findOne({ role: 'admin' });
    const totalWorkouts = await Workout.countDocuments();
    const totalDiets = await Diet.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();

    res.json({
      message: '✅ Backend is working',
      mongoConnected: isMongoConnected,
      mongoUri: process.env.MONGO_URI ? '✅ Set' : '❌ NOT SET',
      jwtSecret: process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET',
      adminEmail: process.env.ADMIN_EMAIL,
      port: process.env.PORT || 5000,
      adminUserExists: !!adminUser,
      stats: {
        totalUsers,
        totalWorkouts,
        totalDiets,
        totalPosts
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Debug status error:', error.message);
    res.status(503).json({
      message: 'Backend error',
      mongoConnected: false,
      error: error.message
    });
  }
});

// ==========================================
// 1. AUTH ENDPOINTS
// ==========================================

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, age, gender, email, phone, password, weightTarget, dailyCalorieTarget, stepCountTarget } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, age, gender, email, phone, password: hashedPassword,
      goals: { weightTarget, dailyCalorieTarget, stepCountTarget }
    });

    res.status(201).json({ token: generateToken(user._id), role: user.role });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });
    if (user.isBlocked) return res.status(403).json({ message: 'Account is blocked' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    res.json({ token: generateToken(user._id), role: user.role });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. PROFILE ENDPOINTS
// ==========================================

app.get('/api/user/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const workoutHistory = await Workout.find({ userId: req.user._id }).sort({ date: -1 }).limit(10);
    
    res.json({ 
      profile: user, 
      workoutHistory: workoutHistory 
    });
  } catch (error) {
    console.error('Profile fetch error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/profile', protect, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. HOME SUMMARY
// ==========================================

app.get('/api/home/summary', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const workouts = await Workout.find({ 
      userId: req.user._id, 
      date: { $gte: today, $lt: tomorrow } 
    });
    
    const diets = await Diet.find({ 
      userId: req.user._id, 
      date: { $gte: today, $lt: tomorrow } 
    });

    const caloriesBurned = workouts.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0);
    const caloriesConsumed = diets.reduce((sum, item) => sum + (item.calories || 0), 0);

    res.json({
      goals: req.user.goals,
      todaySummary: { 
        caloriesBurned: Math.round(caloriesBurned), 
        caloriesConsumed: Math.round(caloriesConsumed), 
        stepsTaken: 0 
      },
      recentWorkouts: workouts,
      recentDiets: diets,
      tip: "Drink at least 3 liters of water today!"
    });
  } catch (error) {
    console.error('Summary error:', error.message);
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// 4. DASHBOARD ENDPOINT
// ==========================================

app.get('/api/dashboard', protect, async (req, res) => {
  try {
    // Get user
    const user = await User.findById(req.user._id).select('-password');

    // Get today's workouts
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const workouts = await Workout.find({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    const diets = await Diet.find({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    // Calculate calories
    const caloriesBurned = workouts.reduce(
      (sum, item) => sum + (item.caloriesBurned || 0),
      0
    );

    const caloriesConsumed = diets.reduce(
      (sum, item) => sum + (item.calories || 0),
      0
    );

    // Send data to frontend
    res.json({
      goals: user.goals || {},

      todaySummary: {
        caloriesBurned,
        caloriesConsumed
      }
    });

  } catch (error) {
    console.error('Dashboard Error:', error.message);

    res.status(500).json({
      message: 'Dashboard fetch failed',
      error: error.message
    });
  }

  const fetchDashboardData = async () => {
  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("No login token found. Please login again.");
      navigate("/");
      return;
    }

    console.log("🔄 Fetching dashboard data...");

    const headers = { Authorization: `Bearer ${token}` };

    // ✅ Fixed: removed /api prefix (baseURL already has it)
    const summaryResponse  = await API.get("/dashboard", { headers });
    const workoutsResponse = await API.get("/workouts", { headers });
    const dietResponse     = await API.get("/diet",     { headers });

    const summary  = summaryResponse?.data  || {};
    const workouts = workoutsResponse?.data || [];
    const dietLogs = dietResponse?.data     || [];

    const caloriesBurned   = summary?.todaySummary?.caloriesBurned  || 0;
    const caloriesConsumed = summary?.todaySummary?.caloriesConsumed || 0;
    const netCalories      = caloriesConsumed - caloriesBurned;

    setDashboardData({
      workouts:          Array.isArray(workouts)  ? workouts  : [],
      dietLogs:          Array.isArray(dietLogs)  ? dietLogs  : [],
      netCalories,
      goals:             summary?.goals || {},
      caloriesBurned,
      caloriesConsumed,
    });

    console.log("✅ Dashboard loaded");

  } catch (err) {
    console.error("Dashboard Error:", err);

    if (err.response?.status === 401) {
      setError("Session expired. Login again.");
      localStorage.clear();
      navigate("/");
    } else if (err.response?.status === 404) {
      setError("API route not found. Check backend route.");
    } else if (err.code === "ERR_NETWORK") {
      setError("Backend server not running on port 5000.");
    } else {
      setError(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  } finally {
    setLoading(false);
  }
};
});



// ==========================================
// 5. WORKOUT ENDPOINTS
// ==========================================

app.post('/api/workouts', protect, async (req, res) => {
  try {
    const { exerciseType, duration, caloriesBurned, date } = req.body;
    
    if (!exerciseType || !duration || !caloriesBurned) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const log = await Workout.create({
      userId: req.user._id,
      exerciseType,
      duration: parseInt(duration),
      caloriesBurned: parseInt(caloriesBurned),
      date: date ? new Date(date) : new Date()
    });
    
    res.status(201).json(log);
  } catch (error) {
    console.error('Workout create error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workouts', protect, async (req, res) => {
  try {
    const logs = await Workout.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    console.error('Workout fetch error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/workouts/:id', protect, async (req, res) => {
  try {
    const log = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!log) return res.status(404).json({ message: 'Workout not found' });
    res.json(log);
  } catch (error) {
    console.error('Workout update error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/workouts/:id', protect, async (req, res) => {
  try {
    const log = await Workout.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!log) return res.status(404).json({ message: 'Workout not found' });
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Workout delete error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. DIET ENDPOINTS
// ==========================================

app.post('/api/diet', protect, async (req, res) => {
  try {
    const { foodItem, calories, mealType, date } = req.body;
    
    if (!foodItem || !calories || !mealType) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const log = await Diet.create({
      userId: req.user._id,
      foodItem,
      calories: parseInt(calories),
      mealType,
      date: date ? new Date(date) : new Date()
    });
    
    res.status(201).json(log);
  } catch (error) {
    console.error('Diet create error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/diet', protect, async (req, res) => {
  try {
    const logs = await Diet.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    console.error('Diet fetch error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/diet/:id', protect, async (req, res) => {
  try {
    const log = await Diet.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!log) return res.status(404).json({ message: 'Diet log not found' });
    res.json(log);
  } catch (error) {
    console.error('Diet update error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/diet/:id', protect, async (req, res) => {
  try {
    const log = await Diet.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!log) return res.status(404).json({ message: 'Diet log not found' });
    res.json({ message: 'Diet log deleted successfully' });
  } catch (error) {
    console.error('Diet delete error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. PROGRESS ENDPOINTS
// ==========================================

app.get('/api/progress/charts', protect, async (req, res) => {
  try {
    const workoutStats = await Workout.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalCaloriesBurned: { $sum: "$caloriesBurned" },
          workoutCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 30 }
    ]);

    const dietStats = await Diet.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalCaloriesConsumed: { $sum: "$calories" }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 30 }
    ]);

    res.json({ workoutStats, dietStats });
  } catch (error) {
    console.error('Progress error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. SOCIAL ENDPOINTS
// ==========================================

app.post('/api/social/posts', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content cannot be empty' });
    }

    const post = await Post.create({
      userId: req.user._id,
      userName: req.user.name,
      content: content.trim()
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Post create error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/social/posts', protect, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (error) {
    console.error('Posts fetch error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/social/posts/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Like error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/social/posts/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      userId: req.user._id,
      userName: req.user.name,
      text: text.trim()
    });
    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Comment error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/social/posts/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Post delete error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/social/follow/:userId', protect, async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    if (!req.user.following) req.user.following = [];
    if (req.user.following.includes(req.params.userId)) {
      return res.status(400).json({ message: 'Already following' });
    }

    req.user.following.push(req.params.userId);
    await req.user.save();
    res.json({ message: 'Followed successfully' });
  } catch (error) {
    console.error('Follow error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/social/unfollow/:userId', protect, async (req, res) => {
  try {
    if (!req.user.following) req.user.following = [];
    req.user.following = req.user.following.filter(id => id.toString() !== req.params.userId.toString());
    await req.user.save();
    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/social/following', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('following', 'name email _id');
    res.json({ following: user.following || [] });
  } catch (error) {
    console.error('Following fetch error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 9. ADMIN ENDPOINTS
// ==========================================

app.get('/api/admin/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Admin users fetch error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id/block', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: 'User status changed', user });
  } catch (error) {
    console.error('Block user error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Workout.deleteMany({ userId: req.params.id });
    await Diet.deleteMany({ userId: req.params.id });
    await Post.deleteMany({ userId: req.params.id });
    res.json({ message: 'User and data deleted' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/logs', protect, adminOnly, async (req, res) => {
  try {
    res.json({
      systemUsage: {
        totalUsers: await User.countDocuments(),
        totalWorkoutLogsAdded: await Workout.countDocuments(),
        totalDietLogsAdded: await Diet.countDocuments(),
        totalPostsCreated: await Post.countDocuments()
      }
    });
  } catch (error) {
    console.error('Admin logs error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ERROR HANDLING
// ==========================================

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n');
  console.log('🚀 Backend Server running on port ' + PORT);
  console.log('📊 Health check: http://localhost:' + PORT + '/api/data');
  console.log('🔍 Debug status: http://localhost:' + PORT + '/api/debug/status');
  console.log('\n');
});