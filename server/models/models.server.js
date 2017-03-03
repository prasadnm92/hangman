/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
module.exports = function() {
    var mongoose = require("mongoose");
    mongoose.Promise = require('bluebird');
    var connectionString = "mongodb://127.0.0.1:27017/hangman";
    console.log("Connecting to local mongo...");
    mongoose.connect(connectionString);

    var clientModel = require("./client.model.server")();
    var model = {
        clientModel: clientModel
    };
    return model;
};