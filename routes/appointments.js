const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { check, validationResult } = require('express-validator');

const Appointments = require('../models/Appointments');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

//@route    GET appointments
//@desc     Get all appointments
//@access   public
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointments.find();
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

//@route    GET appointments/id
//@desc     Get appointments by id
//@access   public
router.get('/:id', async (req, res) => {
  try {
    const appointments = await Appointments.findById(req.params.id);
    //check if appointment exist
    if (!appointments) {
      return res.status(404).json({ msg: 'Appointments does not exist' });
    }

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

//@route    DELETE appointments/:id
//@desc     Delete appointment by id
//@access   private
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointments = await Appointments.findById(req.params.id);

    if (!appointments) {
      return res.status(404).json({ msg: 'Appointment does not exist' });
    }

    const teacher = await Teacher.findById(req.teacher.id).select('-password');
    //check if user is admin
    if (!teacher) {
      res.status(401).json({ msg: 'Unauthorised access' });
    }

    await appointments.remove();

    res.status(200).json({ msg: 'Appointment removed' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
