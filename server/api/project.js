const db = require("../db/connection");
const { ObjectId } = require("mongodb");
const { TEMPLATE_COLLECTION, OBJECT_COLLECTION } = require("../db/names");

const project = {};

project.getAllTemplates = async function (response, data) {
  let result = db
    .getDb(data.project)
    .collection(TEMPLATE_COLLECTION)
    .find({})
    .toArray();
  response.json(await result);
};

project.dump = async function (response, data) {
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
  response.json({ objects, templates });
};

project.restore = async function (response, data) {
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
  response.json(result);
};

project.getContent = async function (response, data) {
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
  response.json({ templates, objects });
};


project.migrate = async function (response, data) {
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
  await db // Creating all objects
    .getDb(data.project)
    .collection(OBJECT_COLLECTION)
    .bulkWrite(replaces, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
};

module.exports = project;
