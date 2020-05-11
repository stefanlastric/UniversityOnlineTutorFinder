const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { check, validationResult } = require('express-validator');

const Roles = require('../models/Role');
const User = require('../models/User');

//@route    GET roles
//@desc     Get all roles
//@access   public
router.get('/', async (req, res) => {
  try {
    const roles = await Roles.find();
    res.json(roles);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

//@route    GET roles/id
//@desc     Get roles by id
//@access   public
router.get('/:id', async (req, res) => {
  try {
    const roles = await Roles.findById(req.params.id);
    //check if role exist
    if (!roles) {
      return res.status(404).json({ msg: 'Roles does not exist' });
    }

    res.json(roles);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

//@route    POST role
//@desc     Create new role
//@access   private
router.post(
  '/',

  [auth, [check('name', 'Name of role is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newRoles = new Roles({
        name: req.body.name,
      });
      const { name } = req.body;

      const rolesFields = {};
      if (name) rolesFields.name = name;
      const roles = await newRoles.save();
      res.json(roles);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server Error' });
    }
  }
);

//@route    DELETE roles/:id
//@desc     Delete role by id
//@access   private
router.delete('/:id', auth, async (req, res) => {
  try {
    const roles = await Roles.findById(req.params.id);

    if (!roles) {
      return res.status(404).json({ msg: 'Roles does not exist' });
    }

    const user = await User.findById(req.user.id).select('-password');
    //TODO check if the user that created it is logged
    if (!user) {
      res.status(401).json({ msg: 'Unauthorised access' });
    }

    await roles.remove();

    res.status(200).json({ msg: 'Roles removed' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.delete('/', async (req, res) => {
  try {
    await Roles.deleteMany();
    return res.status(200).json({ msg: 'success' });
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
