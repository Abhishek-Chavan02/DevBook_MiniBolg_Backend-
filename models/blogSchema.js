// const { Schema, model } = require("mongoose");

// const blogSchema = new Schema({
//   tag: {
//     type: String,
//     trim: true,
//     maxlength: 30,
//   },
//   description: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 1000,
//   },
//   likeCount: {
//     type: Number,
//     default: 0,
//   },
//   messageCount: {
//     type: Number,
//     default: 0,
//   },
//   isDeleted: {
//     type: Boolean,
//     default: false,
//   },
//   createdBy: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Blog = model("Blog", blogSchema);
// module.exports = Blog;
const { Schema, model } = require("mongoose");

const blogSchema = new Schema({
  tag: {
    type: String,
    trim: true,
    maxlength: 30,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  messageCount: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Blog = model("Blog", blogSchema);
module.exports = Blog;
