const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
    },
    contactnumber: {
      type: String,
    },
    education: {
      type: String,
    },
    age: {
      type: Number,
    },
    qualification: {
      type: String,
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
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'role',
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'subjects',
    },

    appointments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'appointments',
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = User = mongoose.model('user', UserSchema);
