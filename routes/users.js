const _ = require('lodash');
const express = require('express');
const {User, validateUser} = require("../models/user");
const bcrypt = require('bcrypt');
const router = new express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/me', auth, async(req, res) => {
    const user = User.findById(req.user._id).select('-password');
    res.send(user);
})

router.post('/', validate(validateUser),async(req, res) => {
    let user = await User.findOne({email: req.body.email});
    if(user) return res.status(400).send("user already registered");

    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
})

module.exports = router; 