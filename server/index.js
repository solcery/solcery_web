const express = require('express');
const path = require('path');
const cluster = require('cluster');
const bodyParser = require('body-parser')
// const mongoose = require("mongoose");
const numCPUs = require('os').cpus().length;
require("dotenv").config({ path: "./config.env" });

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

const apiLibrary = {}


const solceryAPI = function(response, moduleName, params) {
  moduleEntrypoint = apiLibrary[moduleName];
  if (!moduleEntrypoint) {
    throw `API error: non-existent API module ${moduleName}`;
  }
  moduleEntrypoint(params)(response, params.data)
}

const fetchApiCall = function(request, response, params) {
  let rawParams = request.params;
  if (!rawParams)
    return; // TODO
  let moduleName = rawParams['0'].split('.').shift();
  solceryAPI(response, moduleName, params)
}

require('./api/project')(apiLibrary)
require('./api/template')(apiLibrary)

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });

} else {


const db = require("./db/connection");

  const app = express();

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, '../client/build')));

  app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
  app.use(bodyParser.json({limit: '50mb'}));

  // Answer API requests.
  app.get('/api/*', function (request, response) { // TODO
    // fetchApiCall(request, response, request.query)
  });

  app.post('/api/*', (request, response) => {
    fetchApiCall(request, response, request.body)
  });

  // All remaining requests return the React app, so it can handle routing.
  app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });

  app.listen(PORT, function () {
    db.connectToServer(function (err) {
      if (err) console.error(err);
    });
    console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
  });
}
