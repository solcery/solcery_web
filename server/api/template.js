const db = require("../db/connection");
var ObjectId = require('mongodb').ObjectId

const getAll = async function(response, params) {
  let objects = await db
    .getDb("project_eclipse")
    .collection(params.templateCode)
    .find(params.query).toArray();
  response.json(objects);
}

const getOne = async function(response, params) {
  let object = await db
    .getDb("project_eclipse")
    .collection(params.templateCode)
    .findOne(params.query);
  response.json(object);
}

const getById = async function(response, params) {
  let object = await db
    .getDb("project_eclipse")
    .collection(params.templateCode)
    .findOne({ _id: ObjectId(params.objectId) });
  response.json(object);
}

const getSchema = async function(response, params) {
  let schema = await db
    .getDb("project_eclipse")
    .collection("templates")
    .findOne({ code: params.templateCode });
  response.json(schema)
}

const update = async function(response, params) { // TODO: validate
  var query = { _id: ObjectId(params.objectId) };
  var values = { $set: { fields : params.fields } };
  db
    .getDb('project_eclipse')
    .collection("cards")
    .updateOne(query, values, function(err, res) {
    if (err) throw err;
    response.json(res);
  });
}

const clone = async function(response, params) { // TODO: validate
  let object = await db
    .getDb("project_eclipse")
    .collection(params.templateCode)
    .findOne({ _id: ObjectId(params.objectId) });
  if (!object) {
    throw new Error('Error cloning the object')
  }
  object._id = new ObjectId();
  db
    .getDb('project_eclipse')
    .collection("cards")
    .insertOne(object, function(err, res) {
    if (err) throw err;
    response.json(res);
  });
}

const remove = async function(response, params) { // TODO: validate
 db
    .getDb("project_eclipse")
    .collection(params.templateCode)
    .deleteOne({ _id: ObjectId(params.objectId) }, function(err, res) {
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
    if (params.command == 'remove') return remove;  
  }
}
