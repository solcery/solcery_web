const db = require("../../db/connection");
const { ObjectId } = require("mongodb");
const { 
  TEMPLATE_COLLECTION, 
  OBJECT_COLLECTION, 
  LOGS_COLLECTION, 
  VERSIONS_COLLECTION, 
  GAME_PREFIX 
} = require("../../db/names");

const funcs = {};

funcs.getContent = async function (data) {
  let result = {}
  if (data.params.objects) result.objects = await db
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .find({})
    .toArray();
  if (data.params.templates) result.templates = await db
    .getDb(data.project)
    .collection(TEMPLATE_COLLECTION)
    .find({})
    .toArray();
  return result;
};

funcs.restore = async function (data) {
  let { objects, templates } = data.params.src;

  let result = {};
  if (templates) {
    await db // Removing all templates
      .getDb(data.project)
      .collection(TEMPLATE_COLLECTION)
      .remove({});
    templates.forEach(tpl => tpl._id = ObjectId(tpl._id));
    await db // Creating templates
      .getDb(data.project)
      .collection(TEMPLATE_COLLECTION)
      .insertMany(templates, function (err, res) {
        if (err) throw err;
        result.templates = res;
      });
  }
  if (objects) {
    await db // Removing all objects
      .getDb(data.project)
      .collection(OBJECT_COLLECTION)
      .remove({});
    objects.forEach(obj => obj._id = ObjectId(obj._id));
    await db // Creating all objects
      .getDb(data.project)
      .collection(OBJECT_COLLECTION)
      .insertMany(objects, function (err, res) {
        if (err) throw err;
        result.objects = res;
      });
  }
  return result;
};

funcs.getLogs = async function (data) {
  let query = data.params.query ? data.params.query : {};
  return await db
    .getDb(data.project)
    .collection(LOGS_COLLECTION)
    .find(query)
    .toArray();
};

funcs.migrate = async function (data) {
  let replaces = data.params.objects.map(object => {
    let obj = Object.assign({}, object);
    delete obj._id;
    return {
      replaceOne: {
        filter: { _id: ObjectId(object._id) },
        replacement: obj,
      }
    }
  });
  return db // Creating all objects
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .bulkWrite(replaces, function (err, res) {
      if (err) throw err;
      return res;
    });
};

funcs.release = async function (data) {
  let gameDbName = GAME_PREFIX + data.project;
  let count = await db
    .getDb(gameDbName)
    .collection(VERSIONS_COLLECTION)
    .count();
  let dist = {
    _id: new ObjectId(),
    version: count + 1,
    content: {
      web: data.params.contentWeb,
      unity: data.params.contentUnity
    }
  }
  return await db
    .getDb(gameDbName)
    .collection(VERSIONS_COLLECTION)
    .insertOne(dist);
};

const commands = require('./commands');
module.exports = { commands, funcs };