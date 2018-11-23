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

router.post('/all', getAllAreas);
router.post('/class1_2', getAreasByClass1_2);
router.post('/class1', getAreasByClass1);

router.post('/approvals', loggedIn, getApprovals);
router.post('/userFeatures', loggedIn, getUserFeatures);
router.post('/areaIndividual', loggedIn, getIndividual);

router.post('/alterUpdater', loggedIn, alterAreaFeatureUpdaterId);
router.post('/create', loggedIn, createArea);
router.post('/update', loggedIn, updateArea);
router.post('/remove', loggedIn, removeArea);

function getAllAreas(req, res, next) {
  Model.areas.findAll().then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getAreasByClass1_2(req, res, next) {
  Model.areas.findAll({
    where: {
      class1_fi: req.body.class1_fi,
      class2_fi: req.body.class2_fi
    }
  }).then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getAreasByClass1(req, res, next) {
  Model.areas.findAll({
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

  Model.areas.findAll(whereClause).then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getApprovals(req, res, next) {
  let whereClause = {};
  if (!req.body.isAdmin) { whereClause = { where: { updater_id: { [Op.like]: '%' + req.body.loggedUser + '%' } } } }

  Model.areas_approval.findAll(whereClause).then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getIndividual(req, res, next) {
  if (req.body.approval) {
    Model.areas_approval.findOne({ where: { gid: req.body.gid } }).then(result => {
      res.status(200).send(result);
    });
  } else {
    Model.areas.findOne({ where: { gid: req.body.gid } }).then(result => {
      res.status(200).send(result);
    });
  }
}

function alterAreaFeatureUpdaterId(req, res, next) {
  CrudService.updateFeature(res, Model.areas, req.body.body.gid, { updater_id: req.body.body.updater_id, name_fi: req.body.body.name_fi }, req.body.user);
}

function createArea(req, res, next) {
  if (req.body.body.type === 'areaApprovalFeatures') {
    CrudService.createFeature(res, Model.areas, req.body.body, req.body.user);
  } else {
    CrudService.createFeature(res, Model.areas_approval, req.body.body, req.body.user);
  }
}

function updateArea(req, res, next) {
  if (req.body.body.type === 'areaApprovalFeatures') {
    CrudService.updateFeature(res, Model.areas_approval, req.body.body.gid, req.body.body, req.body.user);
  } else {
    CrudService.updateFeature(res, Model.areas, req.body.body.gid, req.body.body, req.body.user);
  }
}

function removeArea(req, res, next) {
  if (req.body.type === 'areaApprovalFeatures') {
    CrudService.deleteFeature(res, Model.areas_approval, req.body.id, req.body.name, req.body.user);
  } else {
    CrudService.deleteFeature(res, Model.areas, req.body.id, req.body.name, req.body.user);
  }
}

module.exports = router
