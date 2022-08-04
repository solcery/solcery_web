const db = require("../../db/connection");
const { USERS_COLLECTION } = require("../../db/names");

const auth = async (data) => {
	data.userId = data.pubkey // TODO: proper keypair check
  	return true;
}

module.exports = auth;
