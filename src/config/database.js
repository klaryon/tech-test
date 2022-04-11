const mongoose = require("mongoose");

const Logger = require("../utils/logger");

const { CUSTOMCONNSTR_DB }  = process.env; 

exports.connect = () => {
  Logger.info("Connecting to the database...");
  // Connecting to the database
  mongoose
    .connect(CUSTOMCONNSTR_DB || "mongodb://localhost:27017/local", {
      useUnifiedTopology: true,
      /*useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,*/
    })
    .then(() => {
      Logger.info("Successfully connected to database");

    })
    .catch((error) => {
      Logger.error({ message: error });
      process.exit(1);
    });
};
