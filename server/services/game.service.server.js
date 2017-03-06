/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
module.exports = function(app, model) {
    var fs = require('fs');
    var Promise = require('bluebird');
    var multer= require('multer');
    var upload = multer({dest: __dirname+"/../../public/files"});   //destination for all file uploads
    var cookieOptions = {
        maxAge:  24 * 60 * 60 * 1000,       // keep cookie alive for a day
        httpOnly: true
    };

    app.get("/api/client", getClientSession);
    app.post("/api/guess", updateGuess);
    app.post("/api/game", startNewGame);
    app.post("/api/wordSet/upload", upload.single('myFile'), uploadWordSet);

    function getClientSession(req, res) {
        /*
        * load a previously created session that is still active on client
        * or the cookie has not expired yet
        *
        * */
        if(req.cookies && req.cookies.sessionID) {
            var sessionID = req.cookies.sessionID;
            model
                .clientModel
                .getClientDetails(sessionID)
                .then(function(existingClient) {
                    if(!existingClient) {
                        /*
                         * if for some reason the cookie is still alive but the db
                         * does not have the session registered then create a new one
                         *
                         * */
                        createClientSession(req, res);
                    }
                    else {
                        res.cookie('sessionID',existingClient.sessionID,cookieOptions);
                        res.send(existingClient);
                    }
                });
        }
        /*
         * if not then create a new session
         *
         * */
        else {
            createClientSession(req, res);
        }
    }

    function createClientSession(req, res) {
        /*
         * create a new session with the default word set
         *
         * */
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
                        res.cookie('sessionID',client.sessionID,cookieOptions);
                        res.send(updatedClient);
                    });
            });
    }

    function uploadWordSet(req, res) {
        var sessionID = req.cookies.sessionID;
        if(!sessionID) {
            /*
             * if client session does not exist in the db then
             * redirect to /game page to create one
             * TODO: use better error handling here so user knows what happened
             *
             * */
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
                                res.cookie('sessionID',updatedClient.sessionID,cookieOptions);
                                if(!client) res.send(null);
                                else res.redirect("/#/game");
                            });
                    });
            });
    }

    function updateGuess(req, res) {
        var currentGuessedLetter = req.body.guessedLetter;
        var sessionID = req.cookies.sessionID;
        if(!sessionID) {
            /*
             * if client session does not exist in the db then
             * redirect to /game page to create one
             * TODO: use better error handling here so user knows what happened
             *
             * */
            res.redirect("/#/game");
            return;
        }
        model
            .clientModel
            .getClientDetails(sessionID)
            .then(function(client) {
                if(client.currentGuesses.indexOf(currentGuessedLetter) >= 0) {
                    /*
                     * if the letter was already guessed before then update anything
                     *
                     * */
                    res.cookie('sessionID',client.sessionID,cookieOptions);
                    res.send(client);
                    return;
                }
                client.currentGuesses.push(currentGuessedLetter);
                if(!client.currentWord.includes(currentGuessedLetter)) {
                    /*
                     * if the guessed letter is not there in the word
                     * then update the number of wrong guesses so far
                     *
                     * */
                    client.wrongGuesses++;
                }

                /*
                 * check if the client has won after this guess
                 *  - for every letter in the word, check if the letter was guessed
                 *  - ignore spaces (to support multi-word word-guessing)
                 * */
                var wordCharArray = client.currentWord.split('');
                client.currWinStatus = wordCharArray.every(function(char) {
                    return client.currentGuesses.indexOf(char) >= 0 || char == ' ';
                });

                /*
                 * check if the client has lost after this guess
                 *  - that is, a total of 10 wrong guesses have been made
                 *
                 * */
                client.currLoseStatus = (client.wrongGuesses==10);

                /*
                 * if client has won/lost, update games played & won
                 *
                 * */
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
            /*
             * if client session does not exist in the db then
             * redirect to /game page to create one
             * TODO: use better error handling here so user knows what happened
             *
             * */
            res.redirect("/#/game");
            return;
        }
        model
            .clientModel
            .getClientDetails(sessionID)
            .then(function(client) {
                startGame(client)
                    .then(function(updatedClient) {
                        res.cookie('sessionID',client.sessionID,cookieOptions);
                        res.send(updatedClient);
                    });
            });
    }

    function startGame(client) {
        if(client.currentWord && client.currentWord.length!=0) {
            /*
             * if client had just played a word, then add it to his
             * set of played words to make sure he doesn't get that
             * word again in the future and reset the current word
             *
             * */
            client.playedWords.push(client.currentWord);
            client.currentWord = "";
        }
        var newWordFound = false, noOfTries = 0;
        while(!newWordFound) {
            /*
             * randomly go through the wordSet and look for a new word
             * to play with that the client has not played before
             *
             * */
            var index = Math.floor(Math.random() * client.wordSet.words.length);
            var checkWord = client.wordSet.words[index].toLowerCase();
            if(client.playedWords.indexOf(checkWord) < 0) {
                /*
                 * if a new word was found to play with, update client details
                 *
                 * */
                client.currentWord = checkWord;
                client.currentGuesses = [];
                client.wrongGuesses = 0;
                client.currWinStatus = client.currLoseStatus = false;
                newWordFound = true;
            }
            /*
             * if no word was found from the wordSet that the client
             * has already played then send back a null, and the
             * UI will take care of showing the right error message
             *
             * */
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
        /*
         * read the newly uploaded file contents from the
         * uploads folder, parse the contents into an array
         * of words that can be stored on the db and return
         * the array
         *
         * */
        var filePath = "public/files/"+filename;
        var fileContents = fs.readFileSync(filePath).toString();
        var wordsInFile = fileContents.split(/[\r\n]+/g);

        return wordsInFile;
    }
};