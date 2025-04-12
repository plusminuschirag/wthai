// server/routes/userRoutes.js
const express = require('express');
const { saveUser, getUser } = require('../controllers/userController');

const router = express.Router();

// Define user routes
router.post('/', saveUser); // Maps POST /user to saveUser controller
router.get('/', getUser);   // Maps GET /user to getUser controller

module.exports = router; 