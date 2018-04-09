const db = require('../../db');
const Model = require('../../db');
const config = require('../../config.js');
const sendMailService = require('../services/sendmailService');

const async = require('async');
const crypto = require('crypto');
const passport = require('passport');
const router = require('express').Router();

require('../scripts/passport.js')(passport, Model.users);

router.get('/initLogin', isLoggedIn);
router.get('/logout', logout);

router.post('/login', loginPost);
router.post('/register', registerPost);
router.post('/forgot', forgotPassword)

function isLoggedIn(req, res, next) {
  if (req.user) {
    res.status(200).send({ message: 'In', user: req.user.username, admin: req.user.admin, updater_id: req.user.updater_id });
  } else {
    res.status(200).send({ message: 'Out', user: null, admin: false, updater_id: null });
  }
}

function logout(req, res) {
  req.logout();
  res.status(200).send({ message: 'Success' });
}

function loginPost(req, res, next) {
  passport.authenticate('basic', (user, info) => {
    if (!user) { return res.status(200).send(info) }

    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.status(200).send({ message: 'Success', user: user.username, admin: user.admin, updater_id: user.updater_id });
    });
  })(req, res, next);
}

function registerPost(req, res, next) {
  passport.authenticate('local-signup', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.status(200).send(info) }

    sendMailService.sendMailNewUser(info);
    return res.status(200).send(info);
  })(req, res, next);
}

function forgotPassword(req, res, next) {
  const userEmail = req.body.email;

  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      Model.users.findOne({ where: { email: userEmail } }).then((user) => {
        if (!user) {
          return res.status(200).send({ message: "Email couldn't be sent to this address" });
        }

        if (user.resetPasswordToken || user.resetPasswordExpires) {
          return res.status(200).send({ message: "Email already sent" });
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000 // 1 hour token

        user.save().then(() => {
          setTimeout(() => { resetTokenExpires(userEmail) }, 3600000);
          done(null, token, user);
        });
      });
    },
    function(token, user, done) {
      const url = 'http://' + config.apiHost + '/api/reset/' + token;
      sendMailService.sendMailForgotPassword(url, userEmail);
      done(null, 'done');
    }
  ], function(err) {
    if (err) return next(err);
    return res.status(200).send({ message: 'Success' });
  });
}

function resetTokenExpires(userEmail) {
  Model.users.findOne({ where: { email: userEmail } }).then((user) => {
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.save();
  });
}

module.exports = router
