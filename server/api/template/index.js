const db = require("../../db/connection");
const { OBJECT_COLLECTION, TEMPLATE_COLLECTION  } = require("../../db/names");
const { ObjectId } = require("mongodb");

const funcs = {};

funcs.getAllObjects = async function (data) {
  let query = Object.assign({ template: data.params.template }, data.params.query);
  return await db
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .find(query)
    .toArray();
};

funcs.getObjectById = async function (data) {
  let query = {
    _id: ObjectId(data.params.objectId),
    template: data.params.template,
  };
  return await db
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .findOne(query);
};

funcs.getSchema = async function (data) {
  let query = {
    code: data.params.template,
  };
  return await db
    .getDb(data.project)
    .collection(TEMPLATE_COLLECTION)
    .findOne(query);
};

funcs.setSchema = async function (data) {
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
      menuOrder: schema.menuOrder,
    },
  };
  return await db.getDb(data.project)
    .collection(TEMPLATE_COLLECTION)
    .updateOne(query, values)
};

funcs.createObject = async function (data) {
  // TODO: validate
  object = {
    _id: new ObjectId(),
    template: data.params.template,
    fields: {
      creationTime: Date.now(),
    },
  };
  return await db.getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .insertOne(object)
};

funcs.updateObjectById = async function (data) {
  // TODO: validate
  var query = {
    _id: ObjectId(data.params.objectId),
    template: data.params.template,
  };
  let fields = {}
  for (let [ field, value ] of Object.entries(data.params.fields)) {
    fields[`fields.${field}`] = value;
  }
  var update = { $set: fields };
  return await db.getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .updateOne(query, update)
};

funcs.cloneObject = async function (data) {
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
  object.fields.creationTime = Date.now();
  return await db.getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .insertOne(object)
};

funcs.removeObjectById = async function (data) {
  let query = {
    _id: ObjectId(data.params.objectId),
    template: data.params.template,
  };
  return await db.getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .deleteOne(query)
};

const commands = require('./commands');
module.exports = { commands, funcs };
