import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import UserModel from './Models/Users.js';
import PostModel from './Models/Post.js';
import Interaction from './Models/Interaction.js';
import Event from './Models/Event.js';
import Reminder from './Models/Reminder.js';
import ModerationModel from './Models/Moderation.js';
import recRouter   from './routes/recommendations.js';
import trendRouter from './routes/trending.js';
import interactionsRouter from './routes/interactions.js';




dotenv.config();

/* Cloudinary + Multer-storage */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'assets/event_diary',   
    allowed_formats: ['jpg', 'png', 'webp'],
  },
});

const upload = multer({ storage });  


// Initialize the app
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config(); 
app.use('/api', recRouter);
app.use('/api', trendRouter);
app.use('/api', interactionsRouter);


const EMAIL_USER=process.env.EMAIL_USER;
const EMAIL_PASS=process.env.EMAIL_PASS;
const JWT_SECRET=process.env.JWT_SECRET;
const MONGODB_URI=process.env.MONGODB_URI;


// MongoDB connection string
const conStr="mongodb+srv://admin:1234@cluster0.cdnuppj.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(conStr, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// User registration route

app.post('/insertUser', upload.single('pic'), async (req, res) => {
  try {
    const { email, password, uname } = req.body;
    const pic = req.file ? req.file.path : null;

    if (!uname || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      uname,
      email,
      password: hashedPassword,
      pic
    });

    await newUser.save();
    res.status(201).json({ message: 'User added successfully.' });

  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).json({ error: error.message || 'Error inserting user.' });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json('Email and password are required');
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json('Invalid password');
    }
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        uname: user.uname,
        pic: user.pic,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json('Error logging in');
  }
});

// Logout route
app.post('/logout', (req, res) => {
  try {
    // Clear server-side session or token logic (if applicable)
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});





//forget pass

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service:"Gmail",
  host:"smtp.gmail.com",
  port:465,
  secure: true,
  auth: {
    user: "areejalbusaidi3@gmail.com", // Your email
    pass: "gdqq ftmi qsxq tuxi", // Your email password or app password
  },
});



app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json('User not found');

    // Generate a secure 6-digit reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();

    // Set code expiration time (e.g. 15 minutes from now)
    const resetCodeExpiration = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Update user with reset code and expiration
    user.resetCode = resetCode;
    user.resetCodeExpiration = resetCodeExpiration;
    await user.save();

    // Construct the reset URL 

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset Code',
      html: `<p>You requested a password reset. Your reset code is: <b>${resetCode}</b></p>
             <p>This code will expire in 15 minutes.</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending reset code email:', err);
        return res.status(500).json('Error sending reset code email.');
      }
      res.json('Reset code sent to your email.');
    });

  } catch (error) {
    console.error('Error in forgot-password route:', error);
    res.status(500).json('Server error.');
  }
});




// Route to verify reset code
app.post('/verify-reset-code', async (req, res) => {
  const { email, resetCode } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json('Invalid email.');

    // Check if the reset code matches and is not expired
    if (user.resetCode !== resetCode) {
      return res.status(400).json('Invalid reset code.');
    }

    if (user.resetCodeExpiration < Date.now()) {
      return res.status(400).json('Reset code has expired.');
    }

    res.json('Reset code is valid.');
  } catch (error) {
    console.error('Error in verify-reset-code route:', error);
    res.status(500).json('Server error.');
  }
});


// /reset-password route
// /reset-password route
app.post('/reset-password', async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json('Invalid email.');

    // Check if the reset code matches and is not expired
    if (user.resetCode !== resetCode) {
      return res.status(400).json('Invalid reset code.');
    }

    if (user.resetCodeExpiration < Date.now()) {
      return res.status(400).json('Reset code has expired.');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear reset code and expiration
    user.resetCode = undefined;
    user.resetCodeExpiration = undefined;

    await user.save();

    res.json('Password has been reset successfully.');
  } catch (error) {
    console.error('Error in reset-password route:', error);
    res.status(500).json('Server error.');
  }
});








app.post('/edit-profile', upload.single('pic'), async (req, res) => {
  try {
    const { userId, uname, password, newPassword } = req.body; // 'password' represents oldPassword now
    const pic = req.file ? req.file.path : null;

    if (!userId) {
      return res.status(400).json('User ID is required.');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json('User not found.');
    }

    // Check old password if provided
    if (password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json('Invalid password');
      }
    }

    // Update fields if provided
    if (uname) user.uname = uname;
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }
    if (pic) {
      user.pic = pic;
    
      // Update all posts made by the user with the new profile picture
      await PostModel.updateMany(
        { userEmail: user.email },
        { $set: { userPic: pic } }
      );
    
      // Update all events created by this user with the new profile picture
      await Event.updateMany(
        { organizerEmail: user.email },
        { $set: { userPic: pic } }
      );
    }
    
    await user.save();
    
    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        uname: user.uname,
        email: user.email,
        pic: user.pic,
      },
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json('Error updating profile.');
  }
});



// CREATE POST 
// in your index.js (or wherever you define POST /createPost)
app.post('/createPost', upload.single('image'), async (req, res) => {
  try {
    const {
      userEmail,
      userName,
      userPic,
      textContent,
      eventType,
      location,
      hashtags,
      eventTime,
      startDate,
      endDate,
      eventId,
      title,
      description
    } = req.body;

    const tags = (hashtags || '')
      .split(/\s*,\s*/)
      .filter(Boolean);

    const newPost = new PostModel({
      userEmail,
      userName,
      userPic,
      textContent,
      title,
      description,
      eventType,
      location,
      hashtags: tags,
      eventTime,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventId,
      image: req.file ? req.file.path : null // ✅ image from multer
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});



// GET ALL POSTS 
app.get('/posts', async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ createdAt: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ message: 'Error fetching posts' });
  }
});

// DELETE POST
app.delete('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const deletedPost = await PostModel.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({ message: 'Post deleted successfully', postId });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// to get posts for a specific user by user Id
app.get('/posts/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userPosts = await PostModel.find({ userId }); // or use { userEmail: userId } if that's what you're storing
    return res.status(200).json(userPosts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return res.status(500).json({ message: 'Error fetching user posts' });
  }
});

app.put('/posts/:id', async (req, res) => {
  try {
    const { textContent, title, description } = req.body;
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      { textContent, title, description, editedAt: new Date(),

      },
      { new: true }
    );
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
});



app.put('/posts/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    // Find the post with the corresponding eventId
    const post = await PostModel.findOne({ eventId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found for this event.' });
    }
    // Update the post with the new data sent in req.body
    Object.assign(post, req.body);
    await post.save();
    res.status(200).json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error('Error updating post for event:', error);
    res.status(500).json({ message: 'Error updating post for event.' });
  }
});

// Delete a post by eventId (for event deletion)
app.delete('/posts/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const deletedPost = await PostModel.findOneAndDelete({ eventId });
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found for this event.' });
    }
    res.status(200).json({ message: 'Post deleted successfully', deletedPost });
  } catch (error) {
    console.error('Error deleting post for event:', error);
    res.status(500).json({ message: 'Error deleting post for event.' });
  }
});












// LIKE/UNLIKE A POST
app.post('/posts/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = req.params.id;

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes = post.likes.filter((id) => id !== userId);
      await Interaction.deleteOne({ userId, eventId: post.eventId, interactionType: 'like' });
    } else {
      post.likes.push(userId);
      // Save interaction
      if (post.eventId) {
        await Interaction.create({
          userId,
          eventId: post.eventId,
          interactionType: 'like'
        });
      }
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Error liking post' });
  }
});


// ADD A COMMENT TO A POST
app.post('/posts/:id/comment', async (req, res) => {
  try {
    const { userName, text, userId } = req.body;
    const postId = req.params.id;

    console.log('REQ.BODY RECEIVED:', req.body); // Debugging

    // Prevent empty or undefined comments
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment cannot be empty.' });
    }

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Save comment
    post.comments.push({ userName, text: text.trim() });
    await post.save();

    
    console.log('Saving interaction for event:', { userId, eventId: post.eventId });

    console.log('Trying to log interaction:', { userId, eventId: post.eventId, text });


    // Save to Interaction
    if (userId && post.eventId) {
      try {
        await Interaction.create({
          userId,
          eventId: post.eventId,
          interactionType: 'comment',
          commentText: text.trim()
        });
      } catch (innerErr) {
        console.error('Interaction logging failed:', innerErr);
      }
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error('Error commenting on post:', error);
    res.status(500).json({ message: 'Error commenting on post' });
  }
});




app.delete('/posts/:postId/comment/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Filter out the comment
    post.comments = post.comments.filter((c) => c._id.toString() !== commentId);
    await post.save();

    res.status(200).json(post); // Return the updated post
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

// Create a new event request
app.post('/events', upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      location,
      hashtags,
      eventTime,
      startDate,
      endDate,
      organizerName,
      organizerEmail,
      submittedAt,
      userPic
    } = req.body;

     const tags = (hashtags || '')
      .split(/\s*,\s*/)
      .filter(Boolean);


    // Convert to Date objects
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (start < now) {
      return res.status(400).json({ message: 'Start date cannot be in the past.' });
    }
    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be before start date.' });
    }

    const imagePath = req.file ? req.file.path : null;

    const newEvent = new Event({
      title,
      description,
      eventType,
      location,
      hashtags: tags,
      eventTime,
      startDate: start, 
      endDate: end,
      organizerName,
      organizerEmail,
      submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
      image: imagePath,
      userPic
    });

    await newEvent.save();

    res.status(201).json({
      message: 'Event request submitted successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
});



// to update event status
app.put('/events/:id/status', async (req, res) => {
  try {
    const { status } = req.body; //  'approved' or 'rejected'
    const { id } = req.params;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

     if (status === 'approved') {
      await PostModel.create({
        userEmail:    updatedEvent.organizerEmail,
        userName:     updatedEvent.organizerName,
        userPic:      updatedEvent.userPic,
        textContent:  `${updatedEvent.title}\n${updatedEvent.description}`,
        eventType:    updatedEvent.eventType,
        location:     updatedEvent.location,
        hashtags:     updatedEvent.hashtags,
        eventTime:    updatedEvent.eventTime,
        startDate:    updatedEvent.startDate,
        endDate:      updatedEvent.endDate,
        eventId:      updatedEvent._id.toString(),
        image:        updatedEvent.image
      });
    }

    res.status(200).json({ message: 'Status updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({ message: 'Error updating event status' });
  }
});

// GET all events (for fetching events in the app)
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ submittedAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// updated events (capture originalData)
app.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1) fetch the existing event
    const existing = await Event.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 2) snapshot the pre-edit fields 
    const original = {
      title:       existing.title,
      description: existing.description,
      eventType:   existing.eventType,
      location:    existing.location,
      hashtags:    existing.hashtags,
      eventTime:   existing.eventTime,
      startDate:   existing.startDate,
      endDate:     existing.endDate,
      image:       existing.image,
    };

    // 3) apply edits + stash originalData
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        ...req.body,
        editedByUser:  true,
        status:       'pending',
        originalData: original  
      },
      { new: true }
    );

    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
});





// ADMIN UPDATE EVENT 
app.put('/admin/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Update the event document with all the fields sent in req.body
    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
});

// ADMIN DELETE EVENT 
app.delete('/admin/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully', event: deletedEvent });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});









// GET /reminders Get reminders for a specific user
app.get('/reminders', async (req, res) => {
  try {
    const { userId } = req.query;
    const reminders = await Reminder.find({ userId });
    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'Error fetching reminders' });
  }
});

// POST /reminders – Save a new reminder
app.post('/reminders', async (req, res) => {
  try {
    const { userId, eventId, eventType, location, startDate } = req.body;

    // 1) Prevent duplicates
    const existing = await Reminder.findOne({ userId, eventId });
    if (existing) {
      return res.status(400).json({ message: 'Reminder already exists.' });
    }

    // 2) Save the Reminder
    const reminder = new Reminder({ userId, eventId, eventType, location, startDate });
    await reminder.save();

    // 3) ALSO log it as an Interaction for analytics
    try {
      await Interaction.create({
        userId,
        eventId,
        interactionType: 'remind'
      });
    } catch (logErr) {
      console.error('Failed to log remind interaction:', logErr);
      // return success to the client
    }

    // 4) Return the saved reminder
    res.status(201).json({ message: 'Reminder saved successfully', reminder });

  } catch (error) {
    console.error('Error saving reminder:', error);
    res.status(500).json({ message: 'Error saving reminder', error });
  }
});

// DELETE /reminders/:id – Remove a reminder
app.delete('/reminders/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    res.status(200).json({ message: 'Reminder removed successfully', reminder });
  } catch (error) {
    console.error('Error removing reminder:', error);
    res.status(500).json({ message: 'Error removing reminder', error });
  }
});

// Mark an event as viewed by the user
app.put('/events/:id/viewed', async (req, res) => {
  try {
    const ev = await Event.findByIdAndUpdate(
      req.params.id,
      { viewedByUser: true },
      { new: true }
    );
    if (!ev) return res.status(404).json({ message: 'Event not found.' });
    res.json(ev);
  } catch (err) {
    console.error('Error marking viewed:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Hide an event when the organizer deletes it
app.delete('/events/:id', async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { hiddenFromManage: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event hidden', event: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Proxy route to call the Flask content moderation API
app.post('/moderatePost', async (req, res) => {
  const { userEmail, post_text } = req.body;
  try {
    // Call the Flask API running on port 5000
    const response = await axios.post('http://127.0.0.1:5000/predict', { post_text }, {
      headers: { 'Content-Type': 'application/json' }
    });
    const prediction = response.data.prediction;

    if (prediction === 1) {
      // Save a moderation record
      await ModerationModel.create({
        userEmail,
        postText: post_text,
        message: 'This post was removed due to violation of guidelines'
      });
    }

    // Respond with the prediction
    res.status(200).json({ prediction });
  } catch (error) {
    console.error('Error calling moderation API:', error);
    res.status(500).json({ error: 'Error moderating content' });
  }
});

// Fetch moderation alerts (admin sees all, user sees their own)
app.get('/moderations', async (req, res) => {
  try {
    const filter = {};
    if (req.query.userEmail) {
      filter.userEmail = req.query.userEmail;
    }
    // only apply the acknowledged filter when asked
    if (req.query.unacknowledged === 'true') {
      filter.acknowledged = false;
    }
    const items = await ModerationModel.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { /*…*/ }
});


app.put('/moderations/:id/acknowledge', async (req, res) => {
  try {
    const mod = await ModerationModel.findByIdAndUpdate(
      req.params.id,
      { acknowledged: true },
      { new: true }
    );
    if (!mod) return res.status(404).json({ message: 'Not found' });
    res.json(mod);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET one event by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id).lean();
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    res.json(ev);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// Start the server
app.listen(8080,()=>{
  console.log("Server Connected..");
})
