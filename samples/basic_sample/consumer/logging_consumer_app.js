"use strict";

var fs = require("fs");
var path = require("path");
var util = require("util");
var kcl = require("../../..");
var logger = require("../../util/logger");
var DB = require("./db.js");

const mongodbConnectString = process.env.MONGO_URL;
var mongodbCollection = "logdata";
var database = new DB();

function recordProcessor() {
  var log = logger().getLogger("recordProcessor");
  var shardId;

  return {
    initialize: function(initializeInput, completeCallback) {
      shardId = initializeInput.shardId;

      // WARNING – the connection string may contain the password and so consider removing logging for any production system
      log.info(util.format("About to connect to %s.", mongodbConnectString));
      database.connect(mongodbConnectString, function(err) {
        log.info(
          util.format("Back from connecting to %s", mongodbConnectString)
        );
        if (err) {
          log.info(
            util.format("Back from connecting to %s", mongodbConnectString)
          );
        }
        completeCallback();
      });
    },

    processRecords: function(processRecordsInput, completeCallback) {
      log.info(util.format("In processRecords", mongodbConnectString));

      if (!processRecordsInput || !processRecordsInput.records) {
        completeCallback();
        return;
      }
      var records = processRecordsInput.records;
      var record, data, sequenceNumber, partitionKey, objectToStore;
      for (var i = 0; i < records.length; ++i) {
        record = records[i];
        data = new Buffer(record.data, "base64").toString();
        sequenceNumber = record.sequenceNumber;
        partitionKey = record.partitionKey;
        log.info(
          util.format(
            "ShardID: %s, Record: %s, SeqenceNumber: %s, PartitionKey:%s",
            shardId,
            data,
            sequenceNumber,
            partitionKey
          )
        );
        objectToStore = {};
        try {
          objectToStore = JSON.parse(data);
        } catch (err) {
          // Looks like it wasn't JSON so store the raw string
          objectToStore.payload = data;
        }
        objectToStore.metaData = {};
        objectToStore.metaData.timeAdded = new Date();
        database.addDocument(mongodbCollection, objectToStore, function(
          err
        ) {});
      }
      if (!sequenceNumber) {
        completeCallback();
        return;
      }
      // If checkpointing, completeCallback should only be called once checkpoint is complete.
      processRecordsInput.checkpointer.checkpoint(sequenceNumber, function(
        err,
        sequenceNumber
      ) {
        log.info(
          util.format(
            "Checkpoint successful. ShardID: %s, SeqenceNumber: %s",
            shardId,
            sequenceNumber
          )
        );
        completeCallback();
      });
    },

    shutdown: function(shutdownInput, completeCallback) {
      // Checkpoint should only be performed when shutdown reason is TERMINATE.
      if (shutdownInput.reason !== "TERMINATE") {
        completeCallback();
        return;
      }
      // Whenever checkpointing, completeCallback should only be invoked once checkpoint is complete.
      database.close(function() {
        shutdownInput.checkpointer.checkpoint(function(err) {
          completeCallback();
        });
      });
    }
  };
}

kcl(recordProcessor()).run();
