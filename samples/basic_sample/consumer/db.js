var MongoClient = require("mongodb").MongoClient;
var assert = require("assert");
var logger = require("../../util/logger");
var util = require("util");

function DB() {
  this.db = "empty";
  this.log = logger().getLogger("mongoMange-DB");
}

DB.prototype.connect = function (uri, databaseName, callback) {
  this.log.info(util.format("About to connect to DB"));
  if (this.db != "empty") {
    callback();
    this.log.info("Already connected to database.");
  } else {
    var _this = this;
    MongoClient.connect(uri, function (err, client) {
      if (err) {
        _this.log.info(util.format("Error connecting to DB: %s", err.message));
        callback(err);
      } else {
        _this.db = client.db(databaseName);
        _this.log.info(util.format("Connected to database."));
        callback();
      }
    });
  }
};

DB.prototype.close = function (callback) {
  log.info("Closing database");
  this.db.close();
  this.log.info("Closed database");
  callback();
};

DB.prototype.addDocument = function (coll, doc, callback) {
  var collection = this.db.collection(coll);
  var _this = this;
  collection.insertOne(doc, function (err, result) {
    if (err) {
      _this.log.info(util.format("Error inserting document: %s", err.message));
      callback(err.message);
    } else {
      _this.log.info(
        util.format("Inserted document into %s collection.", coll)
      );
      callback();
    }
  });
};

module.exports = DB;
