const db = require("../../db/connection");
const { ObjectId } = require("mongodb");
const { GAMES_COLLECTION, VERSIONS_COLLECTION, GAME_INFO_COLLECTION } = require("../../db/names");

const funcs = {};

funcs.getGameInfo = async function (data) {
  return await db
    .getDb(data.project)
    .collection(GAME_INFO_COLLECTION)
    .findOne({});
};

funcs.startNewGame = async function (data) {
  let version = data.params.contentVersion;
  if (!version) {
    version = await db
      .getDb(data.project)
      .collection(VERSIONS_COLLECTION)
      .count();
  }
  let content = await db
    .getDb(data.project)
    .collection(VERSIONS_COLLECTION)
    .findOne({ version });
  if (!content) {
    throw new Error(`No content found with contentVersion ${version}!`)
  }
  let game = await db
    .getDb(data.project)
    .collection(GAMES_COLLECTION)
    .findOne({ status: 'ongoing', players: data.userId });
  if (game) {
    throw new Error(`Cannot create game. There already is an ongoing game [${game._id}] for player ${data.userId}!`);
  }
  let playerNfts =  data.params.nfts ? data.params.nfts : [];
  game = {
    contentVersion: version,
    players: [ data.userId ],
    nfts: [ playerNfts ],
    status: 'ongoing',
    log: [],
    seed: Math.floor(Math.random() * 256),
  }
  await db
    .getDb(data.project)
    .collection(GAMES_COLLECTION)
    .insertOne(game);
  return game;
};

funcs.getPlayerOngoingGame = async function (data) {
  let query = { 
    status: 'ongoing', 
    players: data.userId 
  };
  let game = await db
    .getDb(data.project)
    .collection(GAMES_COLLECTION)
    .findOne(query);
  return game;
};

funcs.getContentVersion = async function (data) {
  let version = data.params.contentVersion;
  if (!version) {
    version = await db
      .getDb(data.project)
      .collection(VERSIONS_COLLECTION)
      .count();
  }
  return await db
    .getDb(data.project)
    .collection(VERSIONS_COLLECTION)
    .findOne({ version });
};

funcs.action = async function (data) {
  let query = { 
    status: 'ongoing', 
    _id: new ObjectId(data.params.gameId), 
    players: data.userId 
  };
  let game = await db
    .getDb(data.project)
    .collection(GAMES_COLLECTION)
    .findOne(query);
  let log = [ ...game.log, data.params.action ];
  var update = {
    $set: { log },
  };
  await db.getDb(data.project)
    .collection(GAMES_COLLECTION)
    .updateOne(query, update)
  return data.params.action;
};

funcs.leaveGame = async function (data) {
  let query = { 
    status: 'ongoing', 
    _id: new ObjectId(data.params.gameId), 
    players: data.userId 
  };
  let game = await db
    .getDb(data.project)
    .collection(GAMES_COLLECTION)
    .findOne(query);
  let outcome = data.params.outcome;
  let status = outcome ? 'finished' : 'cancelled';
  var update = {
    $set: { 
      status,
      outcome,
    },
  };
  return await db.getDb(data.project)
    .collection(GAMES_COLLECTION)
    .updateOne(query, update)
};

const commands = require('./commands');
module.exports = { commands, funcs };
