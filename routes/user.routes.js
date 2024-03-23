// routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const nodemailer=require("nodemailer")
const userRouter = express.Router();
const crypto = require('crypto'); // Import the crypto module




// Register route

// Nodemailer transporter configuration
const transporter =  nodemailer.createTransport({
    service:"gmail",
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.USER, 
      pass: process.env.APP_PASSWORD,
    },
  });
  
  const generateToken = () => {
    const token = crypto.randomBytes(20).toString('hex');
    console.log("token",token)
    return token;
  };
  
  // Register route
  userRouter.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      // Check if the user already exists
      const existingUser = await UserModel.findOne({ email });
    //   if (existingUser) {
    //     return res.status(400).json({ message: 'User already exists with this email.' });
    //   }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verificationToken: generateToken(), // Generate or assign the verification token
      });
  
      // Save the user to the database
      await newUser.save();
  
      // Send verification email
      await transporter.sendMail({
        from:{name:"Kisaan Mart",address:"KisaanMart@gmail.com"},
        to: newUser.email,
        subject: 'Email Verification',
        text: "Verify Email",
        html: `
        <div style="background-color: #f5f5f5; padding: 20px;">
          <h1 style="color: green; text-align: center;">Kisaan Mart</h1>
          <h2 style="color: #333333;">Thank you for registering!</h2>
          <p style="color: #666666;">Please use the below token to verify your email address:</p>
          <div style="background-color: #ffffff; border: 1px solid #cccccc; padding: 10px; margin-top: 10px;">
            <h3 style="color: #333333;">Verification Token:</h3>
            <p style="color: #0066cc; font-weight: bold;">${newUser.verificationToken}</p>
          </div>
        </div>
      `,
      });
  
      res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Registration failed.' });
    }
  });

  // Verify email route
userRouter.get('/verify', async (req, res) => {
    try {
      const { token } = req.query;
  
      // Find the user by verification token
      const user = await UserModel.findOne({ verificationToken: token });
  
      if (!user) {
        return res.status(404).json({ message: 'Invalid verification token.' });
      }
  
      // Mark the user's email as verified
      user.verified = true;
      user.verificationToken = undefined; // Optional: Clear the verification token after successful verification
      await user.save();
  
      res.status(200).json({ message: 'Email verification successful. You can now login.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Email verification failed.' });
    }
  });

// Login route
userRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check if the user's email is verified
    if (!user.verified) {
      return res.status(403).json({ message: 'Email not verified. Please verify your email first.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // Use a secure secret key (store it in environment variables)
      { expiresIn: '1h' } // Token expiration time
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed.' });
  }
});

module.exports = {userRouter};
