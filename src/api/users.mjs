import 'dotenv/config'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import generatePassword from 'generate-password';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { Router } from 'express';


//function used for modular exponentation - used to RSA decryption
function modExp(base, exponent, modulus) {
  if (modulus === 1n) return 0; 
  let result = 1n;
  base %= modulus; 

  while (exponent > 0n) {
    if (exponent % 2n === 1n) { 
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus; 
    exponent = BigInt(exponent / 2n); 
  }
  return result;
}

//function used to decrypt a character using RSA
//d > 0 - important
function decrypt_character(c){
    let n = 2222694138841018691n;
    let d = BigInt(process.env.PRIVATE_KEY);

    let s = modExp(BigInt(c), d, n);
    return String.fromCharCode(Number(s));
}

//function used to decrypt a JSON object using RSA
function decrypt_json(data){
    let step = 20;

    //parse data in JSON format
    //data = JSON.parse(data);
    let decrypted = {};

    //for everything in the object
    Object.keys(data).forEach(key => {        
        //remove plaintext entry
        let new_data = "";
        let new_key = "";

        //decrypt key
        for (let i = 0; i < key.length; i += step) {
            new_key += decrypt_character(key.substring(i, i + step));
        }

        //decrypt data
        for (let i = 0; i < data[key].length; i += step) {
            new_data += decrypt_character(data[key].substring(i, i + step));
        }
        
        //add the decrypted data
        decrypted[new_key] = new_data;
    });
    return decrypted;
}

function sendOTP(OTP, email, res){
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GOOGLE_EMAIL,
          pass: process.env.GOOGLE_APP_PASSWORD,
        },
        tls: {}
      });
    
    try {
        const mailOptions = {
          from: process.env.GOOGLE_EMAIL,
          to: email,
          subject: 'OTP',
          text: 'Hello, your OTP is ' + OTP,
        };
        
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.error('Error:', error);
          } else {
            console.log('Email sent:', info.response)
          }
        });
     
      } catch (error) {
        console.error('Error in /register:', error);
        return res.status(500).send("Internal Server Error");
      } 

      return res.status(201).send({email: email});
}

// Setup router and MongoDB connection
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
    const { username, password, email } = decrypt_json(req.body);

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
    const user = { 
      username: username, 
      password: password_hashed, 
      email: email,
      otp: generatePassword.generate({
        length: 12,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
      }),
      friday_messages: [], 
    };

    await db.collection('users').insertOne(user);
    
    res.status(201).json({ message: 'User created successfully'});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'User already exists' });
  }
});

// READ - Get a specefic user - used for sign in
router.post('/users/login', async (req, res) => {
  try {
    const { username, password } = decrypt_json(req.body);

    // Simple validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Name, and password are required' });
    }

    const user = { username: username };
    const user_result = await db.collection('users').findOne(user);

    if (!user_result || !(await bcrypt.compare(password, user_result.password))) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    const token = jwt.sign( {userId: user_result._id, username: user_result.username},
      process.env.JWT_SECRET, { expiresIn: '24h' });

    const result = {username: user.username, token: token};
    res.status(201).json(result); // respond with the user
  } catch (error) {
    res.status(500).json({ error: 'User does not exist' });
  }
});

// UPDATE - Update a user by username - used for reset password
router.put('/users/', authenticateToken, async (req, res) => {
  try {
    const { username, password, new_password } = decrypt_json(req.body);

    // Simple validation
    if (!username || !password || !new_password) {
      return res.status(400).json({ error: 'Name, password, and new password are required' });
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10));
    const new_password_hashed = await bcrypt.hash(new_password, salt);

    const user = { username: username };
    const user_result = await db.collection('users').findOne(user);

    if (!user_result || !(await bcrypt.compare(password, user_result.password))) {
      return res.status(400).json({ error: 'Password is not correct' });
    }

    user_result.password = new_password_hashed;

    await db.collection('users').replaceOne({username: username}, user_result);

    res.status(201).json({ message: 'User updated successfully'});
  } catch (error) {
    res.status(500).json({ error: 'Password is not correct' });
  }
});

/*
// UPDATE - Update a user by username - used for updating an email
router.put('/users/email', authenticateToken, async (req, res) => {
  try {
    const { username, email } = decrypt_json(req.body);

    // Simple validation
    if (!username || !email ) {
      return res.status(400).json({ error: 'Name and Email are required' });
    }

    const user = { username: username };
    const user_result = await db.collection('users').findOne(user);

    user_result.email = email;

    await db.collection('users').replaceOne({username: username}, user_result);

    res.status(201).json({ message: 'User updated successfully'});
  } catch (error) {
    res.status(500).json({ error: 'Password is not correct' });
  }
});
*/

// DELETE - Delete a user by username 
router.delete('/users/', authenticateToken, async (req, res) => {
  try {
    const { username } = decrypt_json(req.body);

    // Simple validation
    if (!username) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = { username: username };
    const user_result = await db.collection('users').findOne(user);

    if (!user_result) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    await db.collection('users').deleteOne({username: username});

    res.status(201).json({ message: 'User deleted successfully'});
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// CREATE - create the OTP and send email
router.post('/users/OTP', async (req, res) => {
  try {
    const { email } = decrypt_json(req.body);

    // Simple validation
    if (!email ) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = { email: email };
    const user_result = await db.collection('users').findOne(user);

    if (!user_result) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    user_result.otp = generatePassword.generate({
        length: 12,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
    });

    await db.collection('users').replaceOne({email: email}, user_result);

    return sendOTP(user_result.otp, email, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Email is not correct' });
  }
});

// CREATE - create the OTP and send email
router.post('/users/OTP/verify', async (req, res) => {
  try {
    const { email, OTP } = decrypt_json(req.body);

    // Simple validation
    if (!email || !OTP) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = { email: email };
    const user_result = await db.collection('users').findOne(user);

    if (!user_result) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    if (user_result.otp != OTP) {
      return res.status(400).json({ error: 'OTP Not Correct' });
    }

    user_result.otp = generatePassword.generate({
        length: 12,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
    });

    await db.collection('users').replaceOne({email: email}, user_result);

    const token = jwt.sign( {userId: user_result._id, username: user_result.username},
      process.env.JWT_SECRET, { expiresIn: '24h' });

    const result = {username: user_result.username, token: token};
    res.status(201).json(result); // respond with the user
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'OTP Not Correct' });
  }
});

export default router;