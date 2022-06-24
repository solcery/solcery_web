const db = require("../../db/connection");
const { ObjectId } = require("mongodb");
const { TEMPLATE_COLLECTION, OBJECT_COLLECTION } = require("../../db/names");

const funcs = {};

funcs.getAllTemplates = async function (data) {
  let result = db
    .getDb(data.project)
    .collection(TEMPLATE_COLLECTION)
    .find({})
    .toArray();
  return await result;
};

funcs.dump = async function (data) {
  let objects = await db
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .find({})
    .toArray();
  let templates = await db
    .getDb(data.project)
    .collection(TEMPLATE_COLLECTION)
    .find({})
    .toArray();
  return { objects, templates };
};

funcs.restore = async function (data) {
  let { objects, templates } = data.params.src;

  await db // Removing all templates
    .getDb(data.project)
    .collection(TEMPLATE_COLLECTION)
    .remove({});

  await db // Removing all objects
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .remove({});

  let result = {};
  templates.forEach(tpl => tpl._id = ObjectId(tpl._id));
  objects.forEach(obj => obj._id = ObjectId(obj._id));
  await db // Creating templates
    .getDb(data.project)
    .collection(TEMPLATE_COLLECTION)
    .insertMany(templates, function (err, res) {
      if (err) throw err;
      result.templates = res;
    });
  await db // Creating all objects
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .insertMany(objects, function (err, res) {
      if (err) throw err;
      result.objects = res;
    });
  return result;
};

funcs.getContent = async function (data) {
  let templates = await db
    .getDb(data.project)
    .collection(TEMPLATE_COLLECTION)
    .find({})
    .toArray();
  let objects = await db
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .find({})
    .toArray();
  return { templates, objects };
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

const commands = require('./commands');
module.exports = { commands, funcs };