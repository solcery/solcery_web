const { MongoClient } = require("mongodb");
const databaseUri = process.env.ATLAS_URI;
const client = new MongoClient(databaseUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 
var _db;
 
module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      if (db)
      {
        _db = db.db("project_eclipse");
        console.log("Successfully connected to MongoDB."); 
      }
      return callback(err);
      });
  },
 
  getDb: function (dbName) {
    return client.db(dbName);
  },

  get: async function ({  // DEPRECATED
    project, 
    collection,
    query = {}
  }) {
    let db = client.db(`project_${project}`);
    let result = db
      .collection(collection)
      .find(query)
      .toArray().then()
    return await result
  }
};