const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    contactnumber: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
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
    approved: {
      type: Boolean,
      // 0 not , 1 yes
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = Teacher = mongoose.model('teacher', TeacherSchema);
