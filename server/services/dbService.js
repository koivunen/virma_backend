const cron = require('node-cron');

const db = require('../../db');
const Model = require('../../db');

exports.initDbCleanup = function() {
  // On server start set everything to null or 0
  Model.users.findAll().then((users) => {
    users.forEach((user) => {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      user.failedLoginAttempts = 0;
      user.failedLoginTime = null;

      user.save();
    });
  });

  console.log('Initial user table cleanup executed');
}

exports.scheduleLoginCleanup = function() {
  // Cron schedule for resetting login attemps and time every 2 minutes
  cron.schedule('*/2 * * * *', () => {
    Model.users.findAll().then((users) => {
      users.forEach((user) => {
        user.failedLoginAttempts = 0;
        user.failedLoginTime = null;

        user.save();
      });
    });
    
    console.log('Scheduled login cleanup executed');
  });
}
