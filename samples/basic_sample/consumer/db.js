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
  this.db = "empty";
  this.log = logger().getLogger("mongoMange-DB");
}

DB.prototype.connect = function(uri, callback) {
  this.log.info(util.format("About to connect to DB"));
  if (this.db != "empty") {
    callback();
    this.log.info("Already connected to database.");
  } else {
    var _this = this;
    MongoClient.connect(uri, function(err, client) {
      if (err) {
        _this.log.info(util.format("Error connecting to DB: %s", err.message));
        callback(err);
      } else {
        _this.db = client;
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
  this.db = this.db.db(APPID_DB[doc.application]);
  var _this = this;
  collection.insertOne(doc, function(err, result) {
    console.log("err", err);
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
