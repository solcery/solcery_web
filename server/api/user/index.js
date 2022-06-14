const db = require("../../db/connection");
const { USERS_COLLECTION } = require("../../db/names");
const { ObjectId } = require("mongodb");

const funcs = {};

funcs.getSession = async function (response, data) {
  let query = {
    session: data.params.session
  };
  let result = db
    .getDb(data.project)
    .collection(USERS_COLLECTION)
    .findOne(query);
  response.json(await result);
};

funcs.getById = async function (response, data) {
  let query = {
    _id: ObjectId(data.params.id)
  };
  let result = db
    .getDb(data.project)
    .collection(USERS_COLLECTION)
    .findOne(query);
  response.json(await result);
};

funcs.login = async function (response, data) {
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
  console.log(result.session)
  let session = db.getDb(data.project)
    .collection(USERS_COLLECTION)
    .updateOne(query, { $set: { session: result.session } }, function (err, res) {
      if (err) throw err;
      response.json(result);
    });
};

funcs.update = async function (response, data) {
  if (!data.params.fields) {
    throw new Error('NO PARAMS');
  }
  // TODO: validate
  console.log(data)
  var query = {
    _id: ObjectId(data.params.id),
  };
  var values = { $set: { fields: data.params.fields } };
  db.getDb(data.project)
    .collection(USERS_COLLECTION)
    .updateOne(query, values, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
};

funcs.create = async function (response, data) {
  // TODO: validate
  object = {
    _id: new ObjectId(),
    fields: {
      login: data.login,
      password: data.password,
    }
  };
  db.getDb(data.project)
    .collection(USERS_COLLECTION)
    .insertOne(object, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
};

const commands = require('./commands');
module.exports = { commands, funcs };
