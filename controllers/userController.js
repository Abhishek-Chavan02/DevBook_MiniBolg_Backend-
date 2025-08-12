const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// CREATE USER
async function signUp(req, res) {
    try {
        const { firstname, lastname, username, email, password, role, roleId } = req.body;

        // Check if email already exists
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            firstname,
            lastname,
            username,
            email,
            password: hashedPassword,
            role: role && role.trim() !== "" ? role : "user", // Default if not provided
            roleId: roleId && roleId.trim() !== "" ? roleId : "1002" // Default if not provided
        });

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET || 'mysecretkey',
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                roleId: newUser.roleId
            }
        });

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
            { expiresIn: '1h' }
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
