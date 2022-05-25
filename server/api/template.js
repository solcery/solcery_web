const db = require("../db/connection");
var ObjectId = require('mongodb').ObjectId

const getAll = async function(response, params) {
  let query = Object.assign({ template: params.templateCode }, params.query);
  let objects = await db
    .getDb("project_eclipse")
    .collection('objects')
    .find(query).toArray();
  response.json(objects);
}

const getOne = async function(response, params) {
  let query = Object.assign({ template: params.templateCode }, params.query);
  let object = await db
    .getDb("project_eclipse")
    .collection('objects')
    .findOne(query);
  response.json(object);
}

const getById = async function(response, params) {
  let query = {
    _id: ObjectId(params.objectId),
    template: params.templateCode
  }
  let object = await db
    .getDb("project_eclipse")
    .collection('objects')
    .findOne(query);
  response.json(object);
}

const getSchema = async function(response, params) {
  let query = { 
    code: params.templateCode 
  };
  let schema = await db
    .getDb("project_eclipse")
    .collection("templates")
    .findOne(query);
  response.json(schema)
}

const create = async function(response, params) { // TODO: validate
  object = {
    _id: new ObjectId(),
    template: params.templateCode,
    fields: {},
  };
  db
    .getDb('project_eclipse')
    .collection('objects')
    .insertOne(object, function(err, res) {
    if (err) throw err;
    response.json(res);
  });
}

const update = async function(response, params) { // TODO: validate
  var query = { 
    _id: ObjectId(params.objectId), 
    template: params.templateCode 
  };
  var values = { $set: { fields : params.fields } };
  db
    .getDb('project_eclipse')
    .collection('objects')
    .updateOne(query, values, function(err, res) {
    if (err) throw err;
    response.json(res);
  });
}

const clone = async function(response, params) { // TODO: validate
  let query = { 
    _id: ObjectId(params.objectId), 
    template: params.templateCode
  }
  let object = await db
    .getDb("project_eclipse")
    .collection('objects')
    .findOne(query);
  if (!object) {
    throw new Error('Error cloning the object')
  }
  object._id = new ObjectId();
  db
    .getDb('project_eclipse')
    .collection('objects')
    .insertOne(object, function(err, res) {
    if (err) throw err;
    response.json(res);
  });
}

const removeById = async function(response, params) { 
  let query = { 
    _id: ObjectId(params.objectId), 
    template: params.templateCode 
  }
  db
    .getDb("project_eclipse")
    .collection('objects')
    .deleteOne(query, function(err, res) {
      if (err) throw err;
      response.json(res);
    });
}

const removeAll = async function(response, params) { // TODO: deprecate
  db
    .getDb("project_eclipse")
    .collection('objects')
    .delete({}, function(err, res) {
      if (err) throw err;
      response.json(res);
    });
}

const createMany = async function(response, params) { 
  let objects = params.objects.map(fields => {
    return {
      _id: new ObjectId(),
      template: params.templateCode,
      fields: fields
    }
  })
  db
    .getDb("project_eclipse")
    .collection('objects')
    .insertMany(objects, function(err, res) {
      if (err) throw err;
      response.json(res);
    });
}

module.exports = function(api) {
  api.template = (params) => {
    if (params.command == 'getAll') return getAll;
    if (params.command == 'getOne') return getOne;
    if (params.command == 'getById') return getById;
    if (params.command == 'getSchema') return getSchema;
    if (params.command == 'update') return update;
    if (params.command == 'clone') return clone;
    if (params.command == 'create') return create;
    if (params.command == 'removeById') return removeById;
    if (params.command == 'removeAll') return removeAll; 
    if (params.command == 'createMany') return createMany; 
  }
}
