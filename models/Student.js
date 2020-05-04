const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contactnumber: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
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

module.exports = Student = mongoose.model('student', StudentSchema);
