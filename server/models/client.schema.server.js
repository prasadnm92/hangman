/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
module.exports = function() {

    var mongoose = require("mongoose");
    var ClientSchema = mongoose.Schema({
        sessionId : String,
        wordSet: String,
        currentWord: String,
        currentGuesses: [String],
        wrongGuesses: Number,
        gamesPlayed: Number,
        gamesWon: Number,
        dateFirstPlayed: {type: Date, default: Date.now}
    }, {collection: "client"});

    return ClientSchema;
};