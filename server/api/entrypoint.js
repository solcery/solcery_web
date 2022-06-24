const db = require("../db/connection");
const { LOGS_COLLECTION, USERS_COLLECTION } = require("../db/names");
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

const getUserSession = async (session, project) => {
  let query = { session };
  let result = await db
    .getDb(project)
    .collection(USERS_COLLECTION)
    .findOne(query);
  return result;
}

const apiCall = async (response, data) => {
  let error = undefined;
  let result = {
    status: true,
  }
  let user = undefined;
  let moduleApi = apiLibrary[data.module];
  let command = moduleApi[data.command];
  try {
    if (!moduleApi) {
      throw `API error: unknown API module '${data.module}'!`;
    }
    if (!command) {
      throw `API error: unknown API command '${data.command}'!`;
    }
    if (!command.system && !data.project) {
      throw `API error: project not set for project-specific command!`;
    }
    if (data.session) {
      user = await getUserSession(data.session, data.project);
    }
    if (command.private && !user) {
      throw `API error: Unauthorized access!`
    }
    checkParams(command, data.params); 
    result.data = await command.func(data);
  }
  catch (err) {
    result.error = err;
    result.status = false;
  }
  finally {
    if (result.error || (command && command.log)) 
      log({ 
        userId: user && user._id,
        module: data.module,
        command: data.command,
        params: data.params,
        project: data.project,
        response: result,
        level: result.error ? 'error' : 'log',
      })
    response.json(result)
  }
}

module.exports = apiCall