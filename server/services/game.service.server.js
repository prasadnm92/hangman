/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
module.exports = function(app, model) {
    var fs = require('fs');
    var multer= require('multer');
    var upload = multer({dest: __dirname+"/../../public/files"});

    app.get("/api/client", getClientSession);
    app.post("/api/wordSet/upload", upload.single('myFile'), uploadWordSet);
    app.post("/api/guess", updateGuess);

    function getClientSession(req, res) {
        var client = {
            sessionID : req.sessionID
        };
        console.log("sessionID: "+req.sessionID);
        model
            .clientModel
            .getClientDetails(client.sessionID)
            .then(function(existingClient) {
                if(existingClient) res.send(existingClient);
                else {
                    client.wordSet = {
                        words : readWordsFromFile('words') //default word set
                    };
                    model
                        .clientModel
                        .createClientSession(client)
                        .then(function(client) {
                            startGame(client)
                                .then(function(client) {
                                    res.send(client);
                                });
                        });
                }
            });
    }

    function startGame(client) {
        if(client.currentWord && client.currentWord.length!=0) {
            client.playedWords.push(client.currentWord);
            client.currentWord = "";
        }
        var newWordFound = false;
        while(!newWordFound) {
            var index = Math.floor(Math.random() * client.wordSet.words.length);
            if(!client.playedWords.includes(client.wordSet.words[index])) {
                client.currentWord = client.wordSet.words[index];
                client.currentGuesses = [];
                client.wrongGuesses = 0;
                newWordFound = true;
            }
        }
        return client.save();
    }

    function uploadWordSet(req, res) {
        var sessionID = req.sessionID;
        console.log(req.body.test);
        console.log(req.body.myFile);
        model
            .clientModel
            .getClientDetails(sessionID)
            .then(function(client) {
                var wordSet = {
                    words    : readWordsFromFile(req.file.filename),
                    metadata : {
                        filename        : req.file.filename,
                        originalname    : req.file.originalname,
                        fullPath        : req.file.path,
                        size            : req.file.size,
                        mimeType        : req.file.mimetype
                    }
                };
                client.wordSet = wordSet;
                client.currentGuesses = [];
                client.wrongGuesses = 0;
                client.currentWord = "";
                client
                    .save()
                    .then(function(updatedClient) {
                        startGame(updatedClient)
                            .then(function(client) {
                                res.redirect("#/game");
                            });
                    });
            });
    }

    function readWordsFromFile(filename) {
        var filePath = "public/files/"+filename;
        var fileContents = fs.readFileSync(filePath).toString();
        var wordsInFile = fileContents.split(/[\r\n]+/g);
        return wordsInFile;
    }

    function updateGuess(req, res) {
        var currentGuessLetter = req.body.guessedLetter;
        var sessionID = req.sessionID;
        model
            .clientModel
            .getClientDetails(sessionID)
            .then(function(client) {
                client.currentGuesses.push(currentGuessLetter);
                if(!client.currentWord.includes(currentGuessLetter)) {
                    client.wrongGuesses++;
                }
                client
                    .save()
                    .then(function(updatedClient) {
                        var wordCharArray = updatedClient.currentWord.split('');
                        var playerWon = wordCharArray.every(function(char) {
                            return updatedClient.currentGuesses.indexOf(char) >= 0;
                        });
                        var playerLost = (updatedClient.wrongGuesses==10);

                        var response = {
                            client: updatedClient,
                            winStatus: playerWon,
                            loseStatus: playerLost
                        };
                        res.send(response);
                    });
            });
    }
};