const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { check, validationResult } = require('express-validator');

const Appointment = require('../models/Appointment');
const User = require('../models/User');

//@route    GET appointments
//@desc     Get all appointments
//@access   public
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('users');
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
    const appointments = await Appointment.findById(req.params.id);
    //check if appointment exist
    if (!appointments) {
      return res.status(404).json({ msg: 'Appointment does not exist' });
    }

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

//@route    POST appointment
//@desc     Create new appointment
//@access   private
router.post(
  '/',

  [
    auth,
    [
      check('title', 'Title of appointment is required').not().isEmpty(),
      check('price', 'Price of appointment is required').not().isEmpty(),
      check('timelimit', 'Time limit of appointment is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, price, timelimit } = req.body;

      const appointmentsFields = {};
      if (title) appointmentsFields.title = title;
      if (price) appointmentsFields.price = price;
      if (timelimit) appointmentsFields.timelimit = timelimit;

      // appointmentsFields.users = [req.user];
      // let appointments = await Appointment.findOne({ user: req.user.id });
      // if (appointments) {
      //   //update appointment
      //   appointments = await Appointment.findOneAndUpdate(
      //     { user: req.user.id },
      //     { $set: appointmentsFields },
      //     { new: true, upsert: true }
      //   );
      //   console.log('test');
      //   return res.json(appointments);
      // }
      //create appointment
      const appointments = new Appointment(appointmentsFields);
      await appointments.save();
      await Appointment.findByIdAndUpdate(appointments._id, {
        $push: { users: req.user.id },
      });
      const dbUser = await User.findById(req.user.id);
      await User.findByIdAndUpdate(req.user.id, {
        $push: { appointments: appointments._id },
      });

      res.json(appointments);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server Error' });
    }
  }
);

//@route    DELETE appointments/:id
//@desc     Delete appointment by id
//@access   private
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointments = await Appointment.findById(req.params.id);

    if (!appointments) {
      return res.status(404).json({ msg: 'Appointment does not exist' });
    }

    const user = await User.findById(req.user.id).select('-password');
    //TODO check if the user that created it is logged
    if (!user) {
      res.status(401).json({ msg: 'Unauthorised access' });
    }

    await appointments.remove();

    res.status(200).json({ msg: 'Appointment removed' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.delete('/', async (req, res) => {
  try {
    await Appointment.deleteMany();
    return res.status(200).json({ msg: 'success' });
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
