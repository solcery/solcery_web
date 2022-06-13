const apiLibrary = {
  project: require('./project'),
  template: require('./template'),
  user: require('./user'),
}; 

const apiCall = (response, data) => {
  let moduleApi = apiLibrary[data.module];
  if (!moduleApi) {
    throw `API error: unknown API module '${data.module}'!`;
  }
  let command = moduleApi[data.command] // TODO
  if (!command) {
    throw `API error: unknown API command '${data.command}'!`;
  }
  command(response, data);
}

module.exports = apiCall