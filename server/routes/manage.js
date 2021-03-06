const db = require('../../db');
const Model = require('../../db');
const router = require('express').Router();
const bcrypt = require('bcryptjs');

function loggedIn(req, res, next) {
  if (req.user) {
    if (req.user.dataValues.admin) {
      next();
    } else {
      next(res.status(403));
    }
  } else {
    next(res.status(403));
  }
}

router.get('/users', loggedIn, users);

router.post('/addUser', loggedIn, addUser);
router.post('/removeUser', loggedIn, removeUser);
router.post('/updateUser', loggedIn, updateUser);

function users(req, res, next) {
  Model.users.findAll({ attributes: ['name', 'username', 'email', 'admin', 'organization', 'updater_id'] })
    .then(result => {
      res.status(200).send(result);
    }).catch(next);
}

function addUser(req, res, next) {
  const password = req.body.body.password;
  req.body['password'] = bcrypt.hashSync(password, bcrypt.genSaltSync(12));

  Model.users.create(req.body.body)
    .then(response => {
      res.json({ 'message': response });
    }).catch(error => {
      res.json({ 'message': error });
    });
}

function removeUser(req, res, next) {
  Model.users.destroy({
    where: { username: req.body.body }
  }).then(response => {
    res.json({ 'message': response });
  }).catch(error => {
    res.json({ 'message': error });
  });
}

function updateUser(req, res, next) {
  Model.users.update(req.body.body, {
    where: { username: req.body.body.username }
  }).then(response => {
    res.json({ 'message': response });
  }).catch(error => {
    res.json({ 'message': error });
  });
}

module.exports = router
