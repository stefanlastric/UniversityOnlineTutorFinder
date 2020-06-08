const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
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
      type: String,
      required: true,
    },
    datecreated: {
      type: Date,
      default: Date.now,
    },
    approved: {
      type: Boolean,
      //0 not 1 yes
      default: false,
    },
    users: {
      createdby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
      acceptedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    },
  },
  { timestamps: true }
);

module.exports = Appointment = mongoose.model(
  'appointments',
  AppointmentSchema
);
