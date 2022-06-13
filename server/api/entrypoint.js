const db = require("../db/connection");
const { USERS_COLLECTION } = require("../db/names");
const apiLibrary = {}; 

const addApiModule = (moduleName, { commands, funcs }) => {
  apiLibrary[moduleName] = {};
  for (let [ commandName, commandData ] of Object.entries(commands)) {
    let func = funcs[commandName];
    if (func) {
      apiLibrary[moduleName][commandName] = Object.assign({ func, name: commandName }, commandData)
    }
  }
}

addApiModule('project', require('./project'))
addApiModule('template', require('./template'))
addApiModule('user', require('./user'))

const checkParams = (command, params) => {
  if (!command.params) return true;
  for (let [ param, data ] of Object.entries(command.params)) {
    if (data.required && params[param] === undefined) {
      throw `Missing param ${param} for command ${command.name}!`;
    }
  }
  return true;
}

const checkUser = async (session, project) => {
  let query = { session };
  let result = await db
    .getDb(project)
    .collection(USERS_COLLECTION)
    .findOne(query);
  if (result) return true;
  throw `Unauthorized access!`;
}

const apiCall = async (response, data) => {
  let moduleApi = apiLibrary[data.module];
  if (!moduleApi) {
    throw `API error: unknown API module '${data.module}'!`;
  }
  let command = moduleApi[data.command] // TODO
  if (!command) {
    throw `API error: unknown API command '${data.command}'!`;
  }
  if (!command.system && !data.project) {
    throw `API error: project not set!`;
  }
  if (command.private) {
    await checkUser(data.session, data.project)
  }
  checkParams(command, data.params); 
  command.func(response, data);
}

module.exports = apiCall