const db = require("../db/connection");
const { LOGS_COLLECTION, USERS_COLLECTION } = require("../db/names");

const buildApi = (config) => {
  let api = {}
  if (!config.modules) {
    throw new Error('Trying to build API without given modules!');
  }
  for (let mod of config.modules) {
    let moduleName = mod.name;
    let { commands, funcs } = require(mod.path);
    api[moduleName] = {};
    for (let [ commandName, commandData ] of Object.entries(commands)) {
      let func = funcs[commandName];
      if (func) {
        api[moduleName][commandName] = Object.assign({ func, name: commandName }, commandData)
      }
    }
  }
  if (config.auth) {
    api.auth = require(config.auth);
  }
  return api;
}

const config = require('./config');
const apiLibrary = buildApi(config);

const checkParams = (command, params) => {
  if (!command.params) return true;
  for (let [ param, data ] of Object.entries(command.params)) {
    if (data.required && params[param] === undefined) {
      throw `Missing param ${param} for command ${command.name}!`;
    }
  }
  return true;
}

const log = (data) => {
  entry = {
    timestamp: new Date(Date.now()),
    userId: data.userId,
    module: data.module,
    command: data.command,
    params: data.params,
    response: data.response,
  };
  db.getDb(data.project)
    .collection(LOGS_COLLECTION)
    .insertOne(entry)
}

const apiCall = async (response, data) => {
  let error = undefined;
  let result = {
    status: true,
  }
  console.log(data)
  let moduleApi = apiLibrary[data.module];
  let command = moduleApi[data.command];
  try {
    if (!moduleApi) {
      throw `API error: unknown API module '${data.module}'!`;
    }
    if (!command) {
      throw `API error: unknown API command '${data.command}'!`;
    }
    if (!command.system && !data.project) { // TODO: remove this
      throw `API error: project not set for project-specific command!`;
    }
    if (command.private) {
      let auth = await apiLibrary.auth(data);
      if (!auth) {
        throw `API error: Unauthorized access!`
      }
    }
    checkParams(command, data.params); 
    result.data = await command.func(data);
  }
  catch (err) {
    result.error = err;
    result.status = false;
  }
  finally {
    if (result.error || (command && command.log)) {
      log({ // TODO
        userId: data.userId,
        module: data.module,
        command: data.command,
        params: data.params,
        project: data.project,
        response: result,
        level: result.error ? 'error' : 'log',
      })
    }
    response.json(result)
  }
}

module.exports = apiCall