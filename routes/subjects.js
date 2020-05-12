const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { check, validationResult } = require('express-validator');

const Subject = require('../models/Subject');
const User = require('../models/User');
const Role = require('../models/Role');

//@route    GET subjects
//@desc     Get all subjects
//@access   public
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

//@route    GET subjects/id
//@desc     Get subjects by id
//@access   public
router.get('/:id', async (req, res) => {
  try {
    const subjects = await Subject.findById(req.params.id);
    //check if subject exist
    if (!subjects) {
      return res.status(404).json({ msg: 'Subject does not exist' });
    }

    res.json(subjects);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

//@route    POST subject
//@desc     Create new subject
//@access   private
router.post(
  '/',

  [
    auth,
    [
      check('title', 'Title of subject is required').not().isEmpty(),
      check('priceperhour', 'Price per hour of subject is required')
        .not()
        .isEmpty(),
      check('studentlimit', 'Student limit of subject is required')
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
      const userT = await User.findOne({ _id: req.user.id });
      const roles = await Role.find();

      if (userT.role == null && roles.name != 'Teacher') {
        return res
          .status(401)
          .json({ msg: 'You are not a teacher, authorization denied' });
      }
      const { title, priceperhour, studentlimit } = req.body;

      const subjectsFields = {};
      if (title) subjectsFields.title = title;
      if (priceperhour) subjectsFields.priceperhour = priceperhour;
      if (studentlimit) subjectsFields.studentlimit = studentlimit;

      // subjectsFields.users = [req.user];
      // let subjects = await Subject.findOne({ user: req.user.id });
      // if (subjects) {
      //   //update subject
      //   subjects = await Subject.findOneAndUpdate(
      //     { user: req.user.id },
      //     { $set: subjectsFields },
      //     { new: true, upsert: true }
      //   );
      //   console.log('test');
      //   return res.json(subjects);
      // }
      //create subject
      const subjects = new Subject(subjectsFields);
      await subjects.save();
      await Subject.findByIdAndUpdate(subjects._id, {
        $push: { createdby: req.user.id },
      });
      const dbUser = await User.findById(req.user.id);
      await User.findByIdAndUpdate(req.user.id, {
        $push: { subject: subjects._id },
      });

      res.json(subjects);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server Error' });
    }
  }
);

//@route    DELETE subjects/:id
//@desc     Delete subject by id
//@access   private
router.delete('/:id', auth, async (req, res) => {
  try {
    const subjects = await Subject.findById(req.params.id);

    if (!subjects) {
      return res.status(404).json({ msg: 'Subject does not exist' });
    }
    const userT = await User.findOne({ _id: req.user.id });
    const roles = await Role.find();

    if (
      userT.role == null &&
      roles.name != 'Teacher' &&
      subjects.createdby != userT._id
    ) {
      return res.status(401).json({ msg: 'Authorization denied' });
    }
    await subjects.remove();

    res.status(200).json({ msg: 'Subject removed' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    const userT = await User.findOne({ _id: req.user.id });
    const roles = await Role.find();

    if (userT.role == null && roles.name != 'Admin') {
      return res.status(401).json({ msg: 'Authorization denied' });
    }
    await Subject.deleteMany();
    return res.status(200).json({ msg: 'success' });
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
