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

    const { name, email, password } = req.body;

    try {
      //see if teacher exists
      let teacher = await User.findOne({ email });
      const dbrole = await Role.findOne({ name: 'Teacher' });
      if (teacher) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Teacher already exists' }] });
      }

      //new instance of teacher
      teacher = new User({
        name,
        email,
        password,
      });

      //encrypt password
      const salt = await bcrypt.genSalt(10);
      teacher.password = await bcrypt.hash(password, salt);
      await teacher.save();
      await User.findByIdAndUpdate(teacher._id, {
        $push: { role: dbrole._id },
      });
      const payload = {
        teacher: {
          id: teacher.id,
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

module.exports = router;
