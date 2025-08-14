const express = require("express");
const verifyToken = require("../middleware/auth");
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog
} = require("../controllers/blogController");

const router = express.Router();

// Create a blog (protected)
router.post("/create", verifyToken, createBlog);

// Get all blogs (public or protected)
router.get("/all", getAllBlogs);

// Get blog by ID
router.get("/:id", getBlogById);

// Update blog by ID
router.put("/update/:id", verifyToken, updateBlog);

// Delete blog by ID
router.delete("/delete/:id", verifyToken, deleteBlog);

// Like a blog
router.put("/like/:id", verifyToken, likeBlog);

module.exports = router;
