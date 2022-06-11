const db = require("../db/connection");
var ObjectId = require("mongodb").ObjectId;

const OBJECT_COLLECTION = "objects";
const TEMPLATE_COLLECTION = "templates";

const template = {};

template.getAllObjects = async function (response, data) {
  let query = Object.assign({ template: data.params.template }, data.params.query);
  let objects = await db
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .find(query)
    .toArray();
  response.json(objects);
};

template.getOne = async function (response, data) {
  let query = Object.assign({ template: data.params.template }, data.params.query);
  let object = await db
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .findOne(query);
  response.json(object);
};

template.getObjectById = async function (response, data) {
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

template.getSchema = async function (response, data) {
  let query = {
    code: data.params.template,
  };
  let schema = await db
    .getDb(data.project)
    .collection(TEMPLATE_COLLECTION)
    .findOne(query);
  response.json(schema);
};

template.setSchema = async function (response, data) {
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

template.create = async function (response, data) {
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

template.updateObjectById = async function (response, data) {
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

template.cloneObject = async function (response, data) {
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

template.removeObjectById = async function (response, data) {
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

module.exports = template;
