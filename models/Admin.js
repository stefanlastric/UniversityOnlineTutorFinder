const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'Please Enter your email'],
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'Please Enter your password'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = Admin = mongoose.model('admin', AdminSchema);
