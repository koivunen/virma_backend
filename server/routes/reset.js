const db = require('../../db');
const Model = require('../../db');
const sendMailService = require('../services/sendmailService');
const config = require('../../config.js');

const async = require('async');
const bcrypt = require('bcryptjs');
const router = require('express').Router();
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

router.get('/:token', getResetToken);

router.post('/:token', postResetToken);

function getResetToken(req, res, next) {
  const resetPasswordToken = req.params.token;
  const currentTime = new Date();

  Model.users.findOne({ where: { resetPasswordToken: resetPasswordToken, resetPasswordExpires: { [Op.gt]: currentTime } } }).then((user) => {
    if (!user) {
      res.render('index', { message: 'Salasanan palautuslinkki väärä tai vanhentunut. Koita vaihtaa salasana uudestaan.', url: config.directUrl });
      return next();
    }

    res.render('reset', { message: 'Anna uusi salasanasi.', url: config.directUrl });
  });
}

function postResetToken(req, res, next) {
  const resetPasswordToken = req.params.token;
  const currentTime = new Date();
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  let username = null;
  let userEmail = null;

  if (password.length === 0 || confirmPassword.length === 0) {
    res.render('reset', { message: 'Salasana ei voi olla tyhjä.', url: config.directUrl });
    return next();
  } else if (password !== confirmPassword) {
    res.render('reset', { message: 'Salsanojen on vastattava toisiaan.', url: config.directUrl });
    return next();
  }

  async.waterfall([
    function(done) {
      Model.users.findOne({ where: { resetPasswordToken: resetPasswordToken, resetPasswordExpires: { [Op.gt]: currentTime } } }).then((user) => {
        if (!user) {
          res.render('index', { message: 'Salasanan palautuslinkki väärä tai vanhentunut. Koita vaihtaa salasana uudestaan.', url: config.directUrl });
          return next();
        }

        user.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        username = user.username;
        userEmail = user.email;

        user.save().then(() => {
          done(null, user);
        });
      });
    },
    function(user, done) {
      sendMailService.sendMailPasswordChanged(username, userEmail);
      done(null);
    },
  ], (err) => {
    res.render('reset', { message: 'Salasanasi on vaihdettu.', url: config.directUrl });
  });
}

module.exports = router;
