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
      if (db) {
        _db = db.db("base");
        console.log("Successfully connected to MongoDB.");
      }
      return callback(err);
    });
  },

  getDb: function (dbName) {
    return client.db(dbName);
  },
};
