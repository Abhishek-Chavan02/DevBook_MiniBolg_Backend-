const express = require('express');
const { signUp, login, getUser } = require('../controllers/userController');
const verifyToken = require('../middleware/auth'); 

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.get('/user', verifyToken, getUser);

module.exports = router;
