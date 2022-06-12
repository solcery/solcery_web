const express = require("express");
const path = require("path");
const cluster = require("cluster");
const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
const numCPUs = require("os").cpus().length;
require("dotenv").config({ path: "./config.env" });

const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 5000;

const apiLibrary = {
  project: require('./api/project'),
  template: require('./api/template'),
  user: require('./api/user'),
};

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
    );
  });
} else {
  const db = require("./db/connection");

  const app = express();

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, "../client/build")));

  app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
  app.use(bodyParser.json({ limit: "10mb" }));

  app.post("/api/*", (request, response) => {
    let data = request.body;
    let moduleApi = apiLibrary[data.module];
    if (!moduleApi) {
      throw `API error: unknown API module '${data.module}'!`;
    }
    let command = moduleApi[data.command] // TODO
    if (!command) {
      throw `API error: unknown API command '${data.command}'!`;
    }
    command(response, data);
  });

  // All remaining requests return the React app, so it can handle routing.
  app.get("*", function (request, response) {
    response.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });

  app.listen(PORT, function () {
    db.connectToServer(function (err) {
      if (err) console.error(err);
    });
    console.error(
      `Node ${
        isDev ? "dev server" : "cluster worker " + process.pid
      }: listening on port ${PORT}`
    );
  });
}
