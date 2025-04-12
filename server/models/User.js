const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { // Google User ID (sub)
    type: String,
    required: true,
    unique: true, // Ensure uniqueness based on Google ID
    index: true,  // Add index for faster lookups
  },
  email: {
    type: String,
    required: true,
    unique: true, // Emails should also be unique
    lowercase: true, // Store emails in lowercase
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  picture: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
});

// Update lastLoginAt timestamp before saving
userSchema.pre('save', function(next) {
  if (this.isModified()) { // Update only if document changed (or is new)
    this.lastLoginAt = new Date();
  }
  next();
});

// Compile the schema into a model
// Mongoose will create/use a collection named 'users' (lowercase plural of 'User')
const User = mongoose.model('User', userSchema);

module.exports = User; 