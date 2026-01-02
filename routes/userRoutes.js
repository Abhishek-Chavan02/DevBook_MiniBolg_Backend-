const express = require("express");
const { 
  signUp, 
  login, 
  getAllUsers, 
  deleteUser, 
  updateUser, 
  getUserById,
  setOtp
} = require("../controllers/userController");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Auth routes
router.post("/signup", signUp);
router.post("/login", login);

// Protected user routes
router.get("/getAllUsers", verifyToken, getAllUsers);
router.delete("/deleteUser/:id", verifyToken, deleteUser);
router.put("/updateUser/:id", verifyToken, updateUser);
router.put("/getUserById/:id", verifyToken, getUserById);
router.post("/setOtp", setOtp);

module.exports = router;
