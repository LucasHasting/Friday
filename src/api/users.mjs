import 'dotenv/config'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { Router } from 'express';

const router = Router();
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Keep the connection open for our CRUD operations
let db;
async function connectDB() {
  try {
    await client.connect();
    db = client.db("users"); // Database name
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

// Initialize connection
connectDB();

// JWT Middleware - Protect routes that require authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user; // Add user info to request
    next();
  });
}

// CREATE - Add (create) a new user 
router.post('/users', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Name, and password are required' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10));
    const password_hashed = await bcrypt.hash(password, salt);
    // Check if username exists, return error if so
    const user_possible = {username: username};
    const user_result = await db.collection('users').findOne(user_possible);

    if (user_result && user_result.username) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Add user to the database
    const user = { username: username, password: password_hashed };
    await db.collection('users').insertOne(user);
    
    res.status(201).json({ message: 'User created successfully'});
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user: ' + error.message });
  }
});

// READ - Get a specefic user - used for sign in
router.post('/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Simple validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Name, and password are required' });
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10));
    const password_hashed = await bcrypt.hash(password, salt);

    const user = { username: username };
    const user_result = await db.collection('users').findOne(user);

    if (!user_result && ! (await bcrypt.compare(password_hashed, user_result.password))) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    const token = jwt.sign( {userId: user_result._id, username: user_result.username},
      process.env.JWT_SECRET, { expiresIn: '24h' });

    const result = {username: user.username, token: token}
    res.json(result); // respond with the user
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user: ' + error.message });
  }
});

/*
// UPDATE - Update a user by id - used for reset password
router.put('/users/:password', authenticateToken, async (req, res) => {
  try {
    const { password } = req.params;
    const { username } = req.body;

    // Simple validation
    if (!password || !username) {
      return res.status(400).json({ error: 'Name, and password are required' });
    }

    // Hash new password
    const password_hashed = bcrypt.hash(password);

    const updateData = { username: username, password: password_hashed};

    const result = await db.collection('students').updateOne(
      { username: username },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'User updated successfully',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user: ' + error.message });
  }
});

// DELETE - Delete a student by ID
router.delete('/students/:id', authenticateToken, async (req, res) => {
  try {
    const { password } = req.params;
    const { username } = req.body;

    // Simple validation
    if (!password || !username) {
      return res.status(400).json({ error: 'Name, and password are required' });
    }

    const result = await db.collection('users').deleteOne({ username: username });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ 
      message: 'Student deleted successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student: ' + error.message });
  }
});
*/

export default router;