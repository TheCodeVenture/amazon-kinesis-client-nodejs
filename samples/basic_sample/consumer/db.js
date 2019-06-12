var MongoClient = require("mongodb").MongoClient;
var assert = require("assert");
var logger = require("../../util/logger");
var util = require("util");

const APPID_DB = {
  f7ecc8b5db0045f4ad3d72ff8342f90d: "scorepad-database",
  "42f9fa3f0bf34d00a6339a12f6b3d949": "scorepad-staging",
  ce3610bc642748eea5efa6a599851ae3: "scorepad"
};

function DB() {
  this.client = "empty";
  this.log = logger().getLogger("mongoMange-DB");
}

DB.prototype.connect = function(uri, callback) {
  this.log.info(util.format("About to connect to DB"));
  if (this.client != "empty") {
    callback();
    this.log.info("Already connected to database.");
  } else {
    var _this = this;
    MongoClient.connect(uri, function(err, client) {
      if (err) {
        _this.log.info(util.format("Error connecting to DB: %s", err.message));
        callback(err);
      } else {
        _this.client = client;
        _this.log.info(util.format("Connected to database."));
        callback();
      }
    });
  }
};

DB.prototype.close = function(callback) {
  this.log.info("Closing database");
  this.client.close();
  this.log.info("Closed database");
  callback();
};

DB.prototype.addDocument = function(coll, doc, callback) {
  var db = this.client.db(APPID_DB[doc.application.app_id]);
  var collection = db.collection(coll);
  var _this = this;
  collection.insertOne(doc, function(err, result) {
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
