const db = require('../../db');
const Model = require('../../db');
const router = require('express').Router();
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const CrudService = require('../services/crudService.js');

router.post('/all', getAllPoints);
router.post('/class1_2', getPointsByClass1_2);
router.post('/class1', getPointsByClass1);
router.post('/userFeatures', getUserFeatures);
router.post('/approvals', getApprovals);
router.post('/pointIndividual', getIndividual);

router.post('/alterUpdater', alterPointFeatureUpdaterId);
router.post('/create', createPoint);
router.post('/update', updatePoint);
router.post('/remove', removePoint);

function getAllPoints(req, res, next) {
  Model.points.findAll().then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getPointsByClass1_2(req, res, next) {
  Model.points.findAll({
    where: {
      class1_fi: req.body.class1_fi,
      class2_fi: req.body.class2_fi
    }
  }).then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getPointsByClass1(req, res, next) {
  Model.points.findAll({
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

  Model.points.findAll(whereClause).then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getApprovals(req, res, next) {
  let whereClause = {};
  if (!req.body.isAdmin) { whereClause = { where: { updater_id: { [Op.like]: '%' + req.body.loggedUser + '%' } } } }

  Model.points_approval.findAll(whereClause).then(result => {
    res.status(200).send(result);
  }).catch(next);
}

function getIndividual(req, res, next) {
  if (req.body.approval) {
    Model.points_approval.findOne({ where: { gid: req.body.gid } }).then(result => {
      res.status(200).send(result);
    });
  } else {
    Model.points.findOne({ where: { gid: req.body.gid } }).then(result => {
      res.status(200).send(result);
    });
  }
}

function alterPointFeatureUpdaterId(req, res, next) {
  CrudService.updateFeature(res, Model.points, req.body.body.gid, { updater_id: req.body.body.updater_id, name_fi: req.body.body.name_fi }, req.body.user);
}

function createPoint(req, res, next) {
  if (req.body.body.type === 'pointApprovalFeatures') {
    CrudService.createFeature(res, Model.points, req.body.body, req.body.user);
  } else {
    CrudService.createFeature(res, Model.points_approval, req.body.body, req.body.user);
  }
}

function updatePoint(req, res, next) {
  if (req.body.body.type === 'pointApprovalFeatures') {
    CrudService.updateFeature(res, Model.points_approval, req.body.body.gid, req.body.body, req.body.user);
  } else {
    CrudService.updateFeature(res, Model.points, req.body.body.gid, req.body.body, req.body.user);
  }
}

function removePoint(req, res, next) {
  if (req.body.type === 'pointApprovalFeatures') {
    CrudService.deleteFeature(res, Model.points_approval, req.body.id, req.body.name, req.body.user);
  } else {
    CrudService.deleteFeature(res, Model.points, req.body.id, req.body.name, req.body.user);
  }
}

module.exports = router
