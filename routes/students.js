const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
let secret;
if (!process.env.HEROKU) {
  const config = require('config');
  secret = config.get('jwtSecret');
} else {
  secret = process.env.jwtSecret;
}

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 5 or more characters'
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, contactnumber, age } = req.body;

    try {
      //see if student exists
      let student = await User.findOne({ email });
      const dbrole = await Role.findOne({ name: 'Student' });
      if (student) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Student already exists' }] });
      }

      //new instance of student
      student = new User({
        name,
        email,
        password,
        contactnumber,
        age,
      });

      //encrypt password
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password, salt);
      await student.save();

      await User.findByIdAndUpdate(student._id, {
        $push: { role: dbrole._id },
      });

      const payload = {
        student: {
          id: student.id,
        },
      };
      let secret;
      if (!process.env.HEROKU) {
        const config = require('config');
        secret = config.get('jwtSecret');
      } else {
        secret = process.env.jwtSecret;
      }

      jwt.sign(payload, secret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error!');
    }
  }
);
//@route    GET users
//@desc     Get all students
//@access   public
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ role: '5eb9853a663a7c16c2e7c4aa' });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
