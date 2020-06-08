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
    const appointments = await Appointment.find();
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

      //create appointment
      const appointments = new Appointment(appointmentsFields);
      await appointments.save();
      await Appointment.findByIdAndUpdate(appointments._id, {
        $push: { users: { createdby: req.user.id } },
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

    const userT = await User.findOne({ _id: req.user.id });
    const roles = await Role.findOne({ _id: userT.role });

    if (
      appointments.approved === true ||
      userT.role === null ||
      roles.name != 'Student' ||
      appointments.users.createdby != userT._id
    ) {
      return res.status(401).json({ msg: 'Authorization denied' });
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
    const userT = await User.findOne({ _id: req.user.id });
    const roles = await Role.findOne({ _id: userT.role });

    if (userT.role === null || roles.name != 'Admin') {
      return res.status(401).json({ msg: 'Authorization denied' });
    }
    await Appointment.deleteMany();
    return res.status(200).json({ msg: 'success' });
  } catch (err) {
    console.error(err.message);
  }
});

//@route    DELETE appointments/:idadmin
//@desc     Delete appointment by id by Admin (ADMIN CRUD)
//@access   private
router.delete('/:idadmin', auth, async (req, res) => {
  try {
    const appointments = await Appointment.findById(req.params.id);

    if (!appointments) {
      return res.status(404).json({ msg: 'Appointment does not exist' });
    }

    const userT = await User.findOne({ _id: req.user.id });
    const roles = await Role.findOne({ _id: userT.role });

    if (userT.role === null || roles.name != 'Admin') {
      return res.status(401).json({ msg: 'Authorization denied' });
    }
    await appointments.remove();

    res.status(200).json({ msg: 'Appointment removed' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

//@route    POST appointments/approve/:id
//@desc     Approve a appointment
//@access   Private
router.post('/approve/:id', auth, async (req, res) => {
  try {
    const appointments = await Appointment.findById(req.params.id);

    //check if the appointment has already been approved
    if (appointments.approved === true) {
      return res.status(400).json({ msg: 'Appointment already approved' });
    }

    //check if the person is a teacher
    const userT = await User.findOne({ _id: req.user.id });
    const roles = await Role.findOne({ _id: userT.role });
    if (userT.role === null || roles.name != 'Teacher') {
      return res.status(401).json({ msg: 'Authorization denied' });
    }

    //update of approved on appointment
    await Appointment.updateOne(
      { _id: appointments.id },
      { $set: { approved: 'true' } }
    );

    //adding acceptedby field in Appointment that points to Teacher who accepted it
    await Appointment.findByIdAndUpdate(appointments._id, {
      $push: { users: { acceptedby: req.user.id } },
    });

    await appointments.save();

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
