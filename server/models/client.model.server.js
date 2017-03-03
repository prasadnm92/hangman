/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
module.exports = function() {
    var mongoose = require("mongoose");
    var ClientSchema = require("./client.schema.server.js")();
    var ClientModel = mongoose.model("ClientModel", ClientSchema);

    var api = {
        saveClientSession       : saveClientSession,
        getClientDetails        : getClientDetails,
        updateWordSet           : updateWordSet,
        updateCurrentWord       : updateCurrentWord,
        updateWrongGuesses      : updateWrongGuesses,
        updateGuesses           : updateGuesses,
        updateGamesPlayed       : updateGamesPlayed
    };
    return api;

    function saveClientSession(client) {
        return ClientModel
            .create(client);
    }

    function getClientDetails(sessionId) {
        return ClientModel
            .findOne({sessionId: sessionId});
    }

    function updateWordSet(sessionId, wordSet) {
        return ClientModel
            .update(
                {
                    sessionId: sessionId
                },
                {
                    wordSet: wordSet,
                    currentWord: "",
                    currentGuesses: [],
                    wrongGuesses: 0
                }
            );
    }

    function updateCurrentWord(sessionId, word) {
        return ClientModel
            .update(
                {
                    sessionId: sessionId
                },
                {
                    currentWord: word,
                    currentGuesses: [],
                    wrongGuesses: 0
                }
            );
    }

    function updateWrongGuesses(sessionId, wrongGuesses) {
        return ClientModel
            .update(
                {
                    sessionId: sessionId
                },
                {
                    wrongGuesses: wrongGuesses
                }
            );
    }

    function updateGuesses(sessionId, guessedLetter) {
        return ClientModel
            .findOne({sessionId: sessionId})
            .select({"_id":0, "currentGuesses":1})
            .then(function(currentGuesses) {
                currentGuesses.push(guessedLetter);
                return ClientModel
                    .update(
                        {
                            sessionId: sessionId
                        },
                        {
                            currentGuesses: currentGuesses
                        }
                    );
            });
    }

    function updateGamesPlayed(sessionId, lastGameStatus, playingAgain) {
        var incrWon = lastGameStatus ? 1 : 0;
        var incrGames = playingAgain ? 1 : 0;
        return ClientModel
            .update(
                {
                    sessionId: sessionId
                },
                {
                    $inc: {
                        gamesPlayed: incrGames,
                        gamesWon: incrWon
                    }
                }
            );
    }
};