const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    minlength: 4,
  },
    roleId: {
    type: String,
    minlength: 4,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = model("User", userSchema);
module.exports = User;
