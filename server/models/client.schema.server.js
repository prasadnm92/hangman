/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
module.exports = function() {

    var mongoose = require("mongoose");
    var FileMetadata = mongoose.Schema({
        filename        : String,
        originalName    : String,
        fullPath        : String,
        size            : String,
        mimeType        : String
    });
    var ClientSchema = mongoose.Schema({
        sessionID : String,
        wordSet: {
            words: [String],
            metadata: FileMetadata
        },
        playedWords: [String],
        currentWord: {type: String, default: ""},
        currentGuesses: [String],
        wrongGuesses: {type: Number, default: 0},
        gamesPlayed: {type: Number, default: 0},
        gamesWon: {type: Number, default: 0},
        dateFirstPlayed: {type: Date, default: Date.now}
    }, {collection: "client"});

    return ClientSchema;
};