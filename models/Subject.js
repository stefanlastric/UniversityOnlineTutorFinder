const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    priceperhour: {
      type: String,
      trim: true,
      required: true,
    },
    studentlimit: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  },
  { timestamps: true }
);

module.exports = Subject = mongoose.model('subject', SubjectSchema);
