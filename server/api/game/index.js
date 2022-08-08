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
    id: new ObjectId(),
    contentVersion,
    players: [ data.userId ],
    nfts: [ data.params.nfts ],
    status: 'ongoing',
    log: [],
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

funcs.getVersion = async function (data) {
  let contentVersion = data.params.contentVersion;
  let query = { contentVersion }
  return await db
    .getDb(data.project)
    .collection(VERSIONS_COLLECTION)
    .find({ contentVersion });
};

const commands = require('./commands');
module.exports = { commands, funcs };
