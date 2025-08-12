const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// CREATE USER
async function signUp(req, res) {
    try {
        const { username, email, password } = req.body;

        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET || 'mysecretkey',
            { expiresIn: '10s' }
        );

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// LOGIN USER
async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'mysecretkey',
            { expiresIn: '10s' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// GET USER DETAILS
async function getUser(req, res) {
    try {
        const user = await User.findById(req.userId).select('-password'); // remove password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User fetched successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { signUp, login, getUser };
