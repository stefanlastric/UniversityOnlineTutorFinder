const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    timelimit: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    approved: {
      type: Boolean,
      //0 not 1 yes
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = Subject = mongoose.model('subject', SubjectSchema);
