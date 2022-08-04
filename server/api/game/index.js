const db = require("../../db/connection");
const { ObjectId } = require("mongodb");
const { VERSIONS_COLLECTION } = require("../../db/names");

const funcs = {};

funcs.start = async function (data) {
  let version = data.params.version ?? await db.
    .getDb(data.project)
    .collection(VERSIONS_COLLECTION)
    .count();
  let query = { version }
  let content = await db.
    .getDb(data.project)
    .collection(VERSIONS_COLLECTION)
    .find({ version });
  if (!content) {
    throw new Error(`No content found with version ${version}!`)
  }
  let game = await db
    .getDb(data.project)
    .collection(GAMES_COLLECTION)
    .find({ status: 'ongoing', players: data.userId });
  if (game) {
    throw new Error(`Cannot create game. There already is an ongoing game [${game._id}] for player ${data.userId}!`);
  }
  game = {
    id: new ObjectId(),
    players: [ data.userId ],
    status: 'ongoing',
    nfts: [ data.params.nfts ], // TODO: check
    log: [],
  }
  return await db
    .getDb(data.project)
    .collection(GAMES_COLLECTION)
    .insertOne(game);
};

const commands = require('./commands');
module.exports = { commands, funcs };
