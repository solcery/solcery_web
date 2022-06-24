const db = require("../../db/connection");
const { USERS_COLLECTION } = require("../../db/names");
const { ObjectId } = require("mongodb");

const funcs = {};

funcs.getSession = async function (data) {
  let query = {
    session: data.params.session
  };
  return await db
    .getDb(data.project)
    .collection(USERS_COLLECTION)
    .findOne(query);
};

funcs.getById = async function (data) {
  let query = {
    _id: ObjectId(data.params.id)
  };
  return await db
    .getDb(data.project)
    .collection(USERS_COLLECTION)
    .findOne(query);
};

funcs.login = async function (data) {
  let query = {
    login: data.params.login,
    password: data.params.password,
  };
  let result = await db
    .getDb(data.project)
    .collection(USERS_COLLECTION)
    .findOne(query);
  if (!result) return; // TODO
  result.session = new ObjectId().toString();
  await db.getDb(data.project)
    .collection(USERS_COLLECTION)
    .updateOne(query, { $set: { session: result.session } })
  return result;
};

funcs.update = async function (data) {
  if (!data.params.fields) {
    throw new Error('NO PARAMS');
  }
  var query = {
    _id: ObjectId(data.params.id),
  };
  let fields = {}
  for (let [ field, value ] of Object.entries(data.params.fields)) {
    fields[`fields.${field}`] = value;
  }
  var values = { $set: fields };
  return await db.getDb(data.project)
    .collection(USERS_COLLECTION)
    .updateOne(query, values)
};

funcs.create = async function (data) {
  // TODO: validate
  object = {
    _id: new ObjectId(),
    fields: {
      login: data.login,
      password: data.password,
    }
  };
  return await db.getDb(data.project)
    .collection(USERS_COLLECTION)
    .insertOne(object);
};

const commands = require('./commands');
module.exports = { commands, funcs };
