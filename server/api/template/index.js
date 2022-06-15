const db = require("../../db/connection");
const { OBJECT_COLLECTION, TEMPLATE_COLLECTION  } = require("../../db/names");
const { ObjectId } = require("mongodb");

const funcs = {};

funcs.getAllObjects = async function (response, data) {
  let query = Object.assign({ template: data.params.template }, data.params.query);
  let objects = await db
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .find(query)
    .toArray();
  response.json(objects);
};

funcs.getObjectById = async function (response, data) {
  let query = {
    _id: ObjectId(data.params.objectId),
    template: data.params.template,
  };
  let object = await db
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .findOne(query);
  response.json(object);
};

funcs.getSchema = async function (response, data) {
  let query = {
    code: data.params.template,
  };
  let schema = await db
    .getDb(data.project)
    .collection(TEMPLATE_COLLECTION)
    .findOne(query);
  response.json(schema);
};

funcs.setSchema = async function (response, data) {
  let schema = Object.assign({}, data.params.schema);
  var query = {
    _id: ObjectId(schema._id),
  };
  schema._id = null;
  var values = {
    $set: {
      name: schema.name,
      buildTargets: schema.buildTargets,
      fields: schema.fields,
      hidden: schema.hidden,
    },
  };
  db.getDb(data.project)
    .collection(TEMPLATE_COLLECTION)
    .updateOne(query, values, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
};

funcs.createObject = async function (response, data) {
  // TODO: validate
  object = {
    _id: new ObjectId(),
    template: data.params.template,
    fields: {},
  };
  db.getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .insertOne(object, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
};

funcs.updateObjectById = async function (response, data) {
  // TODO: validate
  var query = {
    _id: ObjectId(data.params.objectId),
    template: data.params.template,
  };
  var values = { $set: { fields: data.params.fields } };
  db.getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .updateOne(query, values, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
};

funcs.cloneObject = async function (response, data) {
  // TODO: validate
  let query = {
    _id: ObjectId(data.params.objectId),
    template: data.params.template,
  };
  let object = await db
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .findOne(query);
  if (!object) {
    throw new Error("Error cloning the object");
  }
  object._id = new ObjectId();
  db.getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .insertOne(object, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
};

funcs.removeObjectById = async function (response, data) {
  let query = {
    _id: ObjectId(data.params.objectId),
    template: data.params.template,
  };
  db.getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .deleteOne(query, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
};

const commands = require('./commands');
module.exports = { commands, funcs };
