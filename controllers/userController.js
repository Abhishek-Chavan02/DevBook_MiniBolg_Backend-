const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const twilio = require("twilio");
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
// CREATE USER
async function signUp(req, res) {
    try {
        const { firstname, lastname, username, email, password, mobile_no, role, roleId } = req.body;

        // 400 Bad Request if required fields are missing
        if (!firstname || !lastname || !username || !email || !password || !mobile_no) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 409 Conflict if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            firstname,
            lastname,
            username,
            email,
            mobile_no,
            password: hashedPassword,
            role: role && role.trim() !== "" ? role : "user",
            roleId: roleId && roleId.trim() !== "" ? roleId : "1002"
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET || 'mysecretkey',
            { expiresIn: '1h' }
        );

        // 201 Created
        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                username: newUser.username,
                email: newUser.email,
                mobile_no: newUser.mobile_no,
                role: newUser.role,
                roleId: newUser.roleId,
                createdAt: newUser.createdAt,
                status: 201
            }
        });

    } catch (err) {
        console.error(err);
        // 500 Internal Server Error
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}



// LOGIN USER
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 400 Bad Request if fields are missing
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // 401 Unauthorized if user not found
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // 401 Unauthorized if password is incorrect
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1h" }
    );

    // 200 OK: Return token and user info (excluding password)
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        createdAt: user.createdAt,
      },
    });

  } catch (err) {
    // 500 Internal Server Error
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}



// GET USER DETAILS
async function getAllUsers(req, res) {
  try {
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    });

    const users = await User.find().select("-password");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

// DELETE USER BY ID
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

// GET USER BY ID
async function getUserById(req, res) {
  try {
    const { id } = req.params;

    // Use findOne instead of findById for string _id
    const user = await User.findOne({ _id: id }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

// UPDATE USER BY ID
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { firstname, lastname, username, email, password, role, roleId } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare update fields
    const updateData = {
      firstname: firstname ?? user.firstname,
      lastname: lastname ?? user.lastname,
      username: username ?? user.username,
      email: email ?? user.email,
      role: role ?? user.role,
      roleId: roleId ?? user.roleId,
    };

    // If password is provided, hash it
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}



async function sendOtp(req, res) {
  try {
    const { mobile_no } = req.body;
    if (!mobile_no) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    // Create JWT containing OTP
    const otpToken = jwt.sign(
      { mobile_no, otp },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: "2m" } // 5 min expiry
    );

    // Send SMS
    await client.messages.create({
      body: `Your login OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobile_no.trim()}`
    });

    // Return token (not OTP)
    return res.status(200).json({ message: "OTP sent", otpToken });

  } catch (err) {
    return res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
}


async function validateOtp(req, res) {
  try {
    const { otpToken, userOtp } = req.body;

    if (!otpToken || !userOtp) {
      return res.status(400).json({ message: "OTP token and OTP are required" });
    }

    // Verify token using secret key
    const decoded = jwt.verify(
      otpToken,
      process.env.JWT_SECRET || "mysecretkey"
    );

    // Compare OTP
    if (decoded.otp !== Number(userOtp)) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
      const user = await User.findOne({ mobile_no: decoded.mobile_no });
    if (!user) {
      return res.status(404).json({ message: "User with this mobile number not found" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1h" }
    );

   return res.status(200).json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        mobile_no: user.mobile_no,
        role: user.role,
        roleId: user.roleId,
        createdAt: user.createdAt,
      },
    });
    

  } catch (err) {
    return res.status(401).json({
      message: "OTP expired or invalid token",
      error: err.message
    });
  }
}



module.exports = { signUp, login, getAllUsers, deleteUser, updateUser, getUserById, sendOtp, validateOtp };
