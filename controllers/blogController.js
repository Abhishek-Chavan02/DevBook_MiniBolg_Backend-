const { default: mongoose } = require("mongoose");
const Blog = require("../models/blogSchema");

// CREATE BLOG
async function createBlog(req, res) {
  try {
    const { tag, description, createdBy } = req.body;

    if (!tag || !description || !createdBy) {
      return res.status(400).json({ message: "Tag, description, and createdBy are required" });
    }

    const newBlog = await Blog.create({
      tag,
      description,
      createdBy,
    });

    return res.status(201).json({
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

// GET ALL BLOGS (excluding soft deleted)
async function getAllBlogs(req, res) {
  try {
    const blogs = await Blog.find({ isDeleted: false }).populate("createdBy", "-password");

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found" });
    }

    return res.status(200).json({
      message: "Blogs fetched successfully",
      blogs,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

// GET BLOG BY ID
async function getBlogById(req, res) {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate("createdBy", "-password");

    if (!blog || blog.isDeleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.status(200).json({
      message: "Blog fetched successfully",
      blog,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

// UPDATE BLOG
async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const { tag, description } = req.body;

    const blog = await Blog.findById(id);
    if (!blog || blog.isDeleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        tag: tag ?? blog.tag,
        description: description ?? blog.description,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

// SOFT DELETE BLOG
async function deleteBlog(req, res) {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog || blog.isDeleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.isDeleted = true;
    await blog.save();

    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

async function toggleLike(req, res) {
  try {
    const { blogId, userId } = req.params;

    // Validate ObjectId format - FIXED THE SYNTAX ERROR HERE
    if (!mongoose.Types.ObjectId.isValid(blogId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog || blog.isDeleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if user already liked the post
    const userIndex = blog.likes.findIndex(id => id.equals(userId));

    if (userIndex !== -1) {
      // User already liked - unlike the post
      blog.likes.pull(userId);
      blog.likeCount -= 1;
      await blog.save();
      
      return res.status(200).json({
        message: "Post unliked",
        likeCount: blog.likeCount,
        isLiked: false
      });
    }

    // User hasn't liked - add like
    blog.likes.push(userId);
    blog.likeCount += 1;
    await blog.save();

    return res.status(200).json({
      message: "Post liked",
      likeCount: blog.likeCount,
      isLiked: true
    });
  } catch (err) {
    console.error("Error in toggleLike:", err);
    return res.status(500).json({ 
      message: "Internal server error",
      error: err.message 
    });
  }
}




module.exports = { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog, toggleLike };