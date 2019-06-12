const recordProcessor = require("./logging_consumer_app.js");

recordProcessor(process.env.MONGO_URL, 'scorepad');
