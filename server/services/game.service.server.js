/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
module.exports = function(app, model) {
    var fs = require('fs');
    var Promise = require('bluebird');
    var multer= require('multer');
    var upload = multer({dest: __dirname+"/../../public/files"});
    var cookieOptions = {
        maxAge:  24 * 60 * 60 * 1000,
        httpOnly: true
    };

    app.get("/api/client", getClientSession);
    app.post("/api/guess", updateGuess);
    app.post("/api/game", startNewGame);
    app.post("/api/wordSet/upload", upload.single('myFile'), uploadWordSet);

    function getClientSession(req, res) {
        if(req.cookies && req.cookies.sessionID) {
            var sessionID = req.cookies.sessionID;
            model
                .clientModel
                .getClientDetails(sessionID)
                .then(function(existingClient) {
                    if(!existingClient) {
                        createClientSession(req, res);
                    }
                    else {
                        res.cookie('sessionID',existingClient.sessionID,cookieOptions);
                        res.send(existingClient);
                    }
                });
        }
        else {
            createClientSession(req, res);
        }
    }

    function createClientSession(req, res) {
        var client = {
            sessionID : req.sessionID,
            wordSet : {
                words : readWordsFromFile('words') //default word set
            }
        };
        model
            .clientModel
            .createClientSession(client)
            .then(function(client) {
                startGame(client)
                    .then(function(updatedClient) {
                        if(!updatedClient) {
                            res.cookie('sessionID',client.sessionID,cookieOptions);
                            res.send(null);
                        }
                        else {
                            res.cookie('sessionID',updatedClient.sessionID,cookieOptions);
                            res.send(updatedClient);
                        }
                    });
            });
    }

    function uploadWordSet(req, res) {
        var sessionID = req.cookies.sessionID;
        if(!sessionID) {
            res.redirect("/#/game");
            return;
        }
        model
            .clientModel
            .getClientDetails(sessionID)
            .then(function(client) {
                client.wordSet = {
                    words    : readWordsFromFile(req.file.filename),
                    metadata : {
                        filename        : req.file.filename,
                        originalName    : req.file.originalname,
                        fullPath        : req.file.path,
                        size            : req.file.size,
                        mimeType        : req.file.mimetype
                    }
                };
                client
                    .save()
                    .then(function(updatedClient) {
                        startGame(updatedClient)
                            .then(function(client) {
                                if(!client) {
                                    res.cookie('sessionID',updatedClient.sessionID,cookieOptions);
                                    res.send(null);
                                }
                                else {
                                    res.cookie('sessionID',client.sessionID,cookieOptions);
                                    res.redirect("/#/game");
                                }
                            });
                    });
            });
    }

    function updateGuess(req, res) {
        var currentGuessedLetter = req.body.guessedLetter;
        var sessionID = req.cookies.sessionID;
        if(!sessionID) {
            res.redirect("/#/game");
            return;
        }
        model
            .clientModel
            .getClientDetails(sessionID)
            .then(function(client) {
                if(client.currentGuesses.indexOf(currentGuessedLetter) >= 0) {
                    res.cookie('sessionID',client.sessionID,cookieOptions);
                    res.send(client);
                    return;
                }
                client.currentGuesses.push(currentGuessedLetter);
                if(!client.currentWord.includes(currentGuessedLetter)) {
                    client.wrongGuesses++;
                }

                var wordCharArray = client.currentWord.split('');
                client.currWinStatus = wordCharArray.every(function(char) {
                    return client.currentGuesses.indexOf(char) >= 0 || char == ' ';
                });
                client.currLoseStatus = (client.wrongGuesses==10);

                if(client.currWinStatus || client.currLoseStatus) {
                    client.gamesPlayed++;
                    if(client.currWinStatus) client.gamesWon++;
                }

                client
                    .save()
                    .then(function(updatedClient) {
                        res.cookie('sessionID',updatedClient.sessionID,cookieOptions);
                        res.send(updatedClient);
                    });
            });
    }

    function startNewGame(req, res) {
        var sessionID = req.cookies.sessionID;
        if(!sessionID) {
            res.redirect("/#/game");
            return;
        }
        model
            .clientModel
            .getClientDetails(sessionID)
            .then(function(client) {
                startGame(client)
                    .then(function(updatedClient) {
                        if(!updatedClient) {
                            res.cookie('sessionID',client.sessionID,cookieOptions);
                            res.send(null);
                        }
                        else {
                            res.cookie('sessionID',updatedClient.sessionID,cookieOptions);
                            res.send(updatedClient);
                        }
                    });
            });
    }

    function startGame(client) {
        if(client.currentWord && client.currentWord.length!=0) {
            client.playedWords.push(client.currentWord);
            client.currentWord = "";
        }
        var newWordFound = false, noOfTries = 0;
        while(!newWordFound) {
            var index = Math.floor(Math.random() * client.wordSet.words.length);
            var checkWord = client.wordSet.words[index].toLowerCase();
            if(client.playedWords.indexOf(checkWord) < 0) {
                client.currentWord = checkWord;
                client.currentGuesses = [];
                client.wrongGuesses = 0;
                client.currWinStatus = client.currLoseStatus = false;
                newWordFound = true;
            }
            if(noOfTries>=client.wordSet.words.length) {
                return new Promise(function(resolve) {
                    resolve(null);
                });
            }
            ++noOfTries;
        }
        return client.save();
    }

    function readWordsFromFile(filename) {
        var filePath = "public/files/"+filename;
        var fileContents = fs.readFileSync(filePath).toString();
        var wordsInFile = fileContents.split(/[\r\n]+/g);

        return wordsInFile;
    }
};