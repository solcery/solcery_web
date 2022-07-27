const db = require("../../db/connection");
const { ObjectId } = require("mongodb");
const { TEMPLATE_COLLECTION, OBJECT_COLLECTION, LOGS_COLLECTION } = require("../../db/names");

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

const commands = require('./commands');
module.exports = { commands, funcs };