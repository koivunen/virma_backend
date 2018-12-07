const db = require('../../db');
const Model = require('../../db');
const router = require('express').Router();
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const CrudService = require('../services/crudService.js');

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    next(res.status(403));
  }
}

router.post('/all', getAllRoutes);
router.post('/class1_2', getRoutesByClass1_2);
router.post('/class1', getRoutesByClass_1);

router.post('/approvals', loggedIn, getApprovals);
router.post('/userFeatures', loggedIn, getUserFeatures);
router.post('/lineIndividual', loggedIn, getIndividual);

router.post('/alterUpdater', loggedIn, alterRouteFeatureUpdaterId);
router.post('/create', loggedIn, createRoute);
router.post('/update', loggedIn, updateRoute);
router.post('/remove', loggedIn, removeRoute);

function getAllRoutes(req, res, next) {
  Model.routes.findAll().then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getRoutesByClass1_2(req, res, next) {
  Model.routes.findAll({
    where: {
      class1_fi: req.body.class1_fi,
      class2_fi: req.body.class2_fi
    }
  }).then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getRoutesByClass_1(req, res, next) {
  Model.routes.findAll({
    where: {
      class1_fi: req.body.class1_fi
    }
  }).then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getUserFeatures(req, res, next) {
  let whereClause = {};
  if (!req.body.isAdmin) { whereClause = { where: { updater_id: { [Op.like]: '%' + req.body.updater_id + '%' } } } }

  Model.routes.findAll(whereClause).then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getApprovals(req, res, next) {
  let whereClause = {};
  if (!req.body.isAdmin) { whereClause = { where: { updater_id: { [Op.like]: '%' + req.body.loggedUser + '%' } } } }

  Model.routes_approval.findAll(whereClause).then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getIndividual(req, res, next) {
  if (req.body.approval) {
    Model.routes_approval.findOne({ where: { gid: req.body.gid } }).then(result => {
      res.status(200).send(result);
    });
  } else {
    Model.routes.findOne({ where: { gid: req.body.gid } }).then(result => {
      res.status(200).send(result);
    });
  }
}


function alterRouteFeatureUpdaterId(req, res, next) {
  CrudService.updateFeature(res, Model.routes, req.body.body.gid, { updater_id: req.body.body.updater_id, name_fi: req.body.body.name_fi }, req.body.user);
}

function createRoute(req, res, next) {
  if (req.body.body.type === 'lineApprovalFeatures') {
    CrudService.createFeature(res, Model.routes, req.body.body, req.body.user);
  } else {
    CrudService.createFeature(res, Model.routes_approval, req.body.body, req.body.user);
  }
}

function updateRoute(req, res, next) {
  if (req.body.body.type === 'lineApprovalFeatures') {
    CrudService.updateFeature(res, Model.routes_approval, req.body.body.gid, req.body.body, req.body.user);
  } else {
    CrudService.updateFeature(res, Model.routes, req.body.body.gid, req.body.body, req.body.user);
  }
}

function removeRoute(req, res, next) {
  if (req.body.type === 'lineApprovalFeatures') {
    CrudService.deleteFeature(res, Model.routes_approval, req.body.id, req.body.name, req.body.user);
  } else {
    CrudService.deleteFeature(res, Model.routes, req.body.id, req.body.name, req.body.user);
  }
}

module.exports = router
