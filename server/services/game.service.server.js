/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
module.exports = function(app, model) {
    var fs = require('fs');
    var multer= require('multer');
    var upload = multer({dest: __dirname+"/../../public/files"});

    app.get("/api/client", getClientSession);
    app.post("/api/wordSet/upload", upload.single('myFile'), uploadWordSet);

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
                    model
                        .clientModel
                        .createClientSession(client)
                        .then(function(client) {
                            res.send(client);
                        });
                }
            });
    }

    function startDefaultGame() {

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
                    words   : readWordsFromFile(req.file.filename),
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
                        res.send(updatedClient);
                    });
                /*model
                 .clientModel
                 .updateWordSet(client.sessionID, wordSet)
                 .then(function(status) {
                 console.log("updateWordSet status: "+status);
                 res.sendStatus(200);
                 });*/
            });
    }

    function readWordsFromFile(filename) {
        console.log(filename);
        var filePath = "public/files/"+filename;
        console.log(filePath);
        var fileContents = fs.readFileSync(filePath).toString();
        var wordsInFile = fileContents.split('\n');
        console.log(wordsInFile.length);
        return wordsInFile;
    }
};