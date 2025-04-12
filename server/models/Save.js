const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-schema for the actual bookmark/content details - SIMPLIFIED
const ContentItemSchema = new Schema({
    url: { type: String, required: true, trim: true },
    savedAt: { type: Date, default: Date.now }
}, { _id: false });

const SaveSchema = new Schema({
    userId: {
        type: String, // Storing the Google User ID (sub) directly
        required: true,
        index: true,
        unique: true // Each user should have only one 'saves' document
    },
    x: [ContentItemSchema], // Array for Twitter/X bookmarks
    reddit: [ContentItemSchema], // ADDED: Array for Reddit saves
    linkedin: [ContentItemSchema], // ADDED: Array for LinkedIn saves
    // Add other platforms here as needed, e.g.:
    // youtube: [ContentItemSchema],
}, { timestamps: true });

// Index the URL within the 'x' array for faster checking
SaveSchema.index({ userId: 1, 'x.url': 1 }); 

// ADDED: Index the URL within the 'reddit' array
SaveSchema.index({ userId: 1, 'reddit.url': 1 }); 

// ADDED: Index the URL within the 'linkedin' array
SaveSchema.index({ userId: 1, 'linkedin.url': 1 }); 

const Save = mongoose.model('Save', SaveSchema);

module.exports = Save; 