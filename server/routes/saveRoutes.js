// server/routes/saveRoutes.js
const express = require('express');
const saveController = require('../controllers/saveController');

const router = express.Router();

// POST /save
router.post('/save', saveController.saveContent);

// GET /user/:userId/saved
router.get('/user/:userId/saved', saveController.getSavedItemsByUser);

module.exports = router; 