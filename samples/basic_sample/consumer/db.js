var MongoClient = require("mongodb").MongoClient;
var assert = require("assert");
var logger = require("../../util/logger");
var util = require("util");

const DATABASE_PER_ENV = {
  development: "scorepad-database",
  staging: "scorepad-staging",
  production: "scorepad"
};

function DB() {
  this.db = "empty";
  this.log = logger().getLogger("mongoMange-DB");
}

DB.prototype.connect = function(uri, callback) {
  this.log.info(util.format("About to connect to DB"));
  var _this = this;
  if (this.db != "empty") {
    callback();
    this.log.info("Already connected to database.");
  } else {
    MongoClient.connect(uri, function(err, client) {
      if (err) {
        _this.log.info(util.format("Error connecting to DB: %s", err.message));
        callback(err);
      } else {
        _this.db = client.db(DATABASE_PER_ENV[process.env.NODE_ENV]);
        _this.log.info(util.format("Connected to database."));
        callback();
      }
    });
  }
};

DB.prototype.close = function(callback) {
  this.log.info("Closing database");
  this.db.close();
  this.log.info("Closed database");
  callback();
};

DB.prototype.addDocument = function(coll, doc, callback) {
  var collection = this.db.collection(coll);
  var _this = this;
  collection.insertOne(doc, function(err, result) {
    if (err) {
      _this.log.info(util.format("Error inserting document: %s", err.message));
      callback(err.message);
    } else {
      console.log("result", result);
      _this.log.info(
        util.format("Inserted document into %s collection.", coll)
      );
      callback();
    }
  });
};

module.exports = DB;
