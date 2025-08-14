const express = require("express");
const verifyToken = require("../middleware/auth");
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleLike
} = require("../controllers/blogController");

const router = express.Router();

// Create a blog (protected)
router.post("/createBlog", verifyToken, createBlog);

// Get all blogs (public or protected)
router.get("/all", getAllBlogs);

// Get blog by ID
router.get("/:id", getBlogById);

// Update blog by ID
router.put("/updateBlog/:id", verifyToken, updateBlog);

// Delete blog by ID
router.delete("/deleteBlog/:id", verifyToken, deleteBlog);

// Like/Unlike a blog
router.put('/like/:blogId/:userId', verifyToken, toggleLike);

module.exports = router;
