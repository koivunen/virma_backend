const db = require('../../db');
const Model = require('../../db');

function createLog(operation, model, name = undefined, user = undefined) {

  const params = {
    operation: operation,
    target_name: name ? name : undefined,
    target_table: model.getTableName(),
    timestamp: new Date,
    executor: user ? user : undefined
  }

  Model.logs.create(params).catch(error => {
    console.log(error);
  });
}

exports.createFeature = function(res, model, params, user) {
  model.create(params).then(response => {
    createLog('CREATE', model, params.name_fi, user);
    res.json({ 'message': response });
  }).catch(error => {
    createLog('CREATE_ERROR', model);
    res.json({ 'message': error });
  });
}

exports.updateFeature = function(res, model, id, params, user) {
  model.update(params, { where: { gid: id } }).then(response => {
    createLog('UPDATE', model, params.name_fi, user);
    res.json({ 'message': response });
  }).catch(error => {
    createLog('UPDATE_ERROR', model);
    res.json({ 'message': error });
  });
}

exports.deleteFeature = function(res, model, id, name, user) {
  model.destroy({ where: { gid: id } }).then(response => {
    createLog('DELETE', model, name, user);
    res.json({ 'message': response });
  }).catch(error => {
    createLog('DELETE_ERROR', model);
    res.json({ 'message': error });
  });
}
