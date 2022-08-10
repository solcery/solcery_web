const db = require("../../db/connection");
const { ObjectId } = require("mongodb");
const { GAMES_COLLECTION, VERSIONS_COLLECTION } = require("../../db/names");

const funcs = {};

funcs.startNewGame = async function (data) {
  let contentVersion = data.params.contentVersion
  if (!contentVersion) {
    console.log('no version given')
    contentVersion = await db
      .getDb(data.project)
      .collection(VERSIONS_COLLECTION)
      .count();
    console.log('inited version ', contentVersion)
  }
  let content = await db
    .getDb(data.project)
    .collection(VERSIONS_COLLECTION)
    .findOne({ contentVersion });
  if (!content) {
    throw new Error(`No content found with contentVersion ${contentVersion}!`)
  }
  let game = await db
    .getDb(data.project)
    .collection(GAMES_COLLECTION)
    .findOne({ status: 'ongoing', players: data.userId });
  if (game) {
    throw new Error(`Cannot create game. There already is an ongoing game [${game._id}] for player ${data.userId}!`);
  }
  game = {
    contentVersion,
    players: [ data.userId ],
    nfts: data.params.nfts,
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
  let query = { status: 'ongoing', players: data.userId };
  let game = await db
    .getDb(data.project)
    .collection(GAMES_COLLECTION)
    .findOne(query);
  return game;
};

funcs.getContentVersion = async function (data) {
  let contentVersion = data.params.contentVersion;
  let query = { contentVersion }
  return await db
    .getDb(data.project)
    .collection(VERSIONS_COLLECTION)
    .findOne({ contentVersion });
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
  var update = {
    $set: { 
      status: 'cancelled'
    },
  };
  return await db.getDb(data.project)
    .collection(GAMES_COLLECTION)
    .updateOne(query, update)
};

const commands = require('./commands');
module.exports = { commands, funcs };
