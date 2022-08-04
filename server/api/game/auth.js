const db = require("../../db/connection");
const { USERS_COLLECTION } = require("../../db/names");

const auth = async (data) => {
  // let query = { session: data.session };
  // let result = await db
  //   .getDb(data.project)
  //   .collection(USERS_COLLECTION)
  //   .findOne(query);
  // if (result) {
  //   data.userId = result._id;
  // }
  // return result;
  return data.session;
}

module.exports = auth