var { MongoClient } = require("mongodb");

const config = require("../config.json");
const { login, password, dbName, collection } = config.mongodb;

const url = `mongodb+srv://${login}:${password}@cluster0-4rslv.mongodb.net/${dbName}?retryWrites=true&w=majority`;

var MongoClient = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports.start = async function () {
  await MongoClient.connect()
    .then(console.log("MongoDB online"))
    .catch((err) => console.error(err));
};

module.exports.getUser = async function (condition) {
  return await MongoClient.db(dbName)
    .collection(collection.users)
    .findOne(condition);
};

module.exports.update = function (update) {
  //console.log("USER :");
  //console.log(update);
  MongoClient.db(dbName)
    .collection(collection.users)
    .replaceOne({ _id: update._id }, update);
};

module.exports.add = function (user) {
  MongoClient.db(dbName).collection(collection.users).insertOne(user);
};

module.exports.get = async function (condition, collection) {
  return await MongoClient.db(dbName).collection(collection).findOne(condition);
};

module.exports.updateDoc = function (doc, col, condition) {
  MongoClient.db(dbName)
    .collection(col)
    .replaceOne(condition, doc, { upsert: true });
};

module.exports.update_field = function (
  col = String,
  condition = Object,
  new_fields = Object
) {
  MongoClient.db(dbName)
    .collection(col)
    .updateOne(condition, { $set: new_fields });
};
