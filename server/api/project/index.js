const db = require("../../db/connection");
const { ObjectId } = require("mongodb");
const { 
  TEMPLATE_COLLECTION, 
  OBJECT_COLLECTION, 
  LOGS_COLLECTION, 
  VERSIONS_COLLECTION, 
  GAME_PREFIX,
  CONFIG_COLLECTION,
  GAME_INFO_COLLECTION
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
  if (data.params.objects) {
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
    await db .getDb(data.project)
      .collection(OBJECT_COLLECTION)
      .bulkWrite(replaces);
  }
  if (data.params.templates) {
    let replaces = data.params.templates.map(template => {
      let tpl = Object.assign({}, template);
      delete tpl._id;
      return {
        replaceOne: {
          filter: { _id: ObjectId(template._id) },
          replacement: tpl,
        }
      }
    });
    await db .getDb(data.project)
      .collection(TEMPLATE_COLLECTION)
      .bulkWrite(replaces);
  }
};

funcs.release = async function (data) {
  let gameDbName = data.params.gameProjectId;
  let count = await db
    .getDb(gameDbName)
    .collection(VERSIONS_COLLECTION)
    .count();
  let version = count + 1;
  let dist = {
    _id: new ObjectId(),
    version,
    content: {
      meta: data.params.contentMeta,
      web: data.params.contentWeb,
      unity: data.params.contentUnity
    }
  }
  let gameSettings = data.params.contentMeta.gameSettings;
  var update = { $set: gameSettings };
  await db.getDb(gameDbName)
    .collection(GAME_INFO_COLLECTION)
    .updateOne({}, update)
  await db
    .getDb(gameDbName)
    .collection(VERSIONS_COLLECTION)
    .insertOne(dist);
  return version;
};

funcs.getConfig = async function (data) {
  let result = {}
  return await db
    .getDb(data.project)
    .collection(CONFIG_COLLECTION)
    .findOne({});
};

funcs.setConfig = async function (data) {
  let fields = {}
  for (let [ field, value ] of Object.entries(data.params.fields)) {
    fields[`fields.${field}`] = value;
  }
  var update = { $set: fields };
  return await db.getDb(data.project)
    .collection(CONFIG_COLLECTION)
    .updateOne({}, update);
};

funcs.sync = async function (data) {
  let project = data.project;
  let projectDb = await db.getDb(data.project);
  let config = await projectDb
    .collection(CONFIG_COLLECTION)
    .findOne({});
  if (!config) {
    throw new Error('Config not found')
  }
  if (!config.fields.sync) {
    throw new Error('Project is not syncable!');
  }
  let sourceProjectId = config.fields.sync.sourceProjectId;
  if (!sourceProjectId) {
    throw new Error('Attempt to sync content of project without source given in config!');
  }
  if (config.fields.sync.isLocked) {
    throw new Error(`Sync is locked with reason "${config.fields.sync.reason}"`);
  }
  let sourceDb = await db.getDb(sourceProjectId);
  if (!sourceDb) {
    throw new Error('Source project not found');
  }
  let src = {};
  src.objects = await sourceDb
    .collection(OBJECT_COLLECTION)
    .find({})
    .toArray();
  src.objects.forEach(obj => obj._id = ObjectId(obj._id));
  src.templates = await sourceDb
    .collection(TEMPLATE_COLLECTION)
    .find({})
    .toArray();
  src.templates.forEach(tpl => tpl._id = ObjectId(tpl._id));
  await projectDb
      .collection(OBJECT_COLLECTION)
      .remove({});
  await projectDb
      .collection(OBJECT_COLLECTION)
      .insertMany(src.objects)
  await projectDb
      .collection(TEMPLATE_COLLECTION)
      .remove({});
  await projectDb
      .collection(TEMPLATE_COLLECTION)
      .insertMany(src.templates);
  return true;
};

const commands = require('./commands');
module.exports = { commands, funcs };
