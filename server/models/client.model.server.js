/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
module.exports = function() {
    var mongoose = require("mongoose");
    var ClientSchema = require("./client.schema.server.js")();
    var ClientModel = mongoose.model("ClientModel", ClientSchema);

    var api = {
        createClientSession     : createClientSession,
        getClientDetails        : getClientDetails,
        updateCurrentWord       : updateCurrentWord,
        updateWrongGuesses      : updateWrongGuesses,
        updateGuesses           : updateGuesses,
        updateGamesPlayed       : updateGamesPlayed
    };
    return api;

    function createClientSession(client) {
        return ClientModel
            .create(client);
    }

    function getClientDetails(sessionID) {
        return ClientModel
            .findOne({sessionID: sessionID});
    }

    /*function updateWordSet(sessionID, wordSet) {
        return ClientModel
            .update(
                {
                    sessionID: sessionID
                },
                {
                    wordSet: wordSet,
                    currentWord: "",
                    currentGuesses: [],
                    wrongGuesses: 0
                }
            );
    }*/

    function updateCurrentWord(sessionID, word) {
        return ClientModel
            .update(
                {
                    sessionID: sessionID
                },
                {
                    currentWord: word,
                    currentGuesses: [],
                    wrongGuesses: 0
                }
            );
    }

    function updateWrongGuesses(sessionID, wrongGuesses) {
        return ClientModel
            .update(
                {
                    sessionID: sessionID
                },
                {
                    wrongGuesses: wrongGuesses
                }
            );
    }

    function updateGuesses(sessionID, guessedLetter) {
        return ClientModel
            .findOne({sessionID: sessionID})
            .select({"_id":0, "currentGuesses":1})
            .then(function(currentGuesses) {
                currentGuesses.push(guessedLetter);
                return ClientModel
                    .update(
                        {
                            sessionID: sessionID
                        },
                        {
                            currentGuesses: currentGuesses
                        }
                    );
            });
    }

    function updateGamesPlayed(sessionID, lastGameStatus, playingAgain) {
        var incrWon = lastGameStatus ? 1 : 0;
        var incrGames = playingAgain ? 1 : 0;
        return ClientModel
            .update(
                {
                    sessionID: sessionID
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