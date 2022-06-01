const db = require("../db/connection");
var ObjectId = require("mongodb").ObjectId;

const TEMPLATE_COLLECTION = "templates";
const OBJECT_COLLECTION = "objects";

const getAllTemplates = async function (response, params) {
  let result = db
    .getDb(params.project)
    .collection(TEMPLATE_COLLECTION)
    .find({})
    .toArray();
  response.json(await result);
};

const dump = async function (response, params) {
  let objects = await db
    .getDb(params.project)
    .collection(OBJECT_COLLECTION)
    .find({})
    .toArray();
  let templates = await db
    .getDb(params.project)
    .collection(TEMPLATE_COLLECTION)
    .find({})
    .toArray();
  response.json({ objects, templates });
};

const restore = async function (response, params) {
  let { objects, templates } = params.src;

  await db // Removing all templates
    .getDb(params.project)
    .collection(TEMPLATE_COLLECTION)
    .remove({});

  await db // Removing all objects
    .getDb(params.project)
    .collection(OBJECT_COLLECTION)
    .remove({});

  let result = {};
  templates.forEach(tpl => tpl._id = ObjectId(tpl._id));
  objects.forEach(obj => obj._id = ObjectId(obj._id));
  await db // Creating templates
    .getDb(params.project)
    .collection(TEMPLATE_COLLECTION)
    .insertMany(templates, function (err, res) {
      if (err) throw err;
      result.templates = res;
    });
  await db // Creating all objects
    .getDb(params.project)
    .collection(OBJECT_COLLECTION)
    .insertMany(objects, function (err, res) {
      if (err) throw err;
      result.objects = res;
    });
  response.json(result);
};

const getContent = async function (response, params) {
  let templates = await db
    .getDb(params.project)
    .collection(TEMPLATE_COLLECTION)
    .find({})
    .toArray();
  let objects = await db
    .getDb(params.project)
    .collection(OBJECT_COLLECTION)
    .find({})
    .toArray();
  response.json({ templates, objects });
};


const migrate = async function (response, params) {
  let replaces = params.objects.map(object => {
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
    .getDb(params.project)
    .collection(OBJECT_COLLECTION)
    .bulkWrite(replaces, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
};

module.exports = function (api) {
  api.project = (params) => {
    if (params.command == "getAllTemplates") return getAllTemplates;
    if (params.command == "restore") return restore;
    if (params.command == "dump") return dump;
    if (params.command == "getContent") return getContent;
    if (params.command == "migrate") return migrate;
  };
};
