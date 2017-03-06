/**
 * Created by JYOTHIPRASAD on 3/5/2017.
 */
var expect  = require("chai").expect;
var request = require("request");
var async = require('async');

var domain = "http://localhost:3000";
var server = '';

before('start the server', function(done) {
    this.timeout(10000);
    server = require('../server.js');
    setTimeout(done,3000);
});

after('stop the server', function(done) {
    server.closeServer;
    done();
});

describe('Testing all APIs of the app', function() {
    var sessionID = '';
    var firstWord = '';
    describe('Initialize the game', function() {
        var url = domain + "/api/client";
        it('returns status 200 and game is setup', function(done) {
            var rawData = "";
            request
                .get(url)
                .on('response',function(response) {
                    expect(response.statusCode).to.equal(200);
                    sessionID = response.headers['set-cookie'][0].split(';')[0].split('=')[1];
                })
                .on('data',function(data) {
                    rawData += data.toString();
                })
                .on('end',function() {
                    var body = JSON.parse(rawData);
                    expect(body.currentWord).to.be.a('string');
                    expect(body.currentWord).to.not.be.empty;
                    expect(body.currentGuesses).to.be.empty;
                    firstWord = body.currentWord;
                    done();
                });
        });
    });

    describe('Start guessing', function() {
        var guesses = -1, wrongGuesses = -1;
        var url = domain + "/api/guess";
        var options = {
            url : url,
            method : 'POST',
            headers : {},
            body : {
                guessedLetter: 'a'
            },
            json : true
        };
        before('initialize request options', function(done) {
            options.headers['Cookie'] = 'sessionID='+sessionID;
            done();
        });

        it('should send the guessed letter and update guesses', function(done) {
            request(options, function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.currentGuesses).to.not.be.empty;
                expect(body.currentGuesses).to.include('a');
                guesses = body.currentGuesses.length;
                wrongGuesses = body.wrongGuesses;
                done();
            });
        });

        it('sending same guess should not affect guesses', function(done) {
            request(options, function(error, response, body) {
                expect(body.currentGuesses.length).to.equal(guesses);
                expect(body.wrongGuesses).to.equal(wrongGuesses);
                done();
            });
        });
    });

    describe('Start a new game', function() {
        var url = domain + "/api/game";
        it('should start a new game', function(done) {
            var options = {
                url : url,
                method : 'POST',
                headers : {
                    'Cookie' : 'sessionID='+sessionID
                },
                json : true
            };
            request(options, function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.currentGuesses).to.be.empty;
                expect(body.currentWord).to.be.a('string');
                expect(body.currentWord).to.not.equal(firstWord);
                done();
            });
        });
    });
});

describe('Testing losing scenario', function() {
    var sessionID = '', currentWord = '', guesses = [];
    before('start a new game', function(done) {
        var url = domain + "/api/client";
        var options = {
            url : url,
            method : 'GET',
            json : true
        };
        request(options, function(error, response, body) {
            sessionID = body.sessionID;
            currentWord = body.currentWord;
            var guessCount = 0;
            for(var i=97;i<=122;i++) {
                var char = String.fromCharCode(i);
                if(!currentWord.includes(char)) {
                    guesses.push(char);
                    if(++guessCount >= 10) break;
                }
            }
            done();
        });
    });

    it('should lose when wrong letters are guessed 10 times', function(done) {
        this.timeout(10000);
        var url = domain + "/api/guess";
        var loseStatus = '', gamesPlayed = -1, gamesWon = -1;
        var options = {
            url : url,
            method : 'POST',
            headers : {
                'Cookie' : 'sessionID='+sessionID
            },
            body : {
                guessedLetter : ''
            },
            json : true
        };
        async.eachSeries(guesses, function(letter, callback) {
            options.body.guessedLetter = letter;
            request(options, function(error, response, body) {
                loseStatus = body.currLoseStatus;
                gamesPlayed = body.gamesPlayed;
                gamesWon = body.gamesWon;

                if(error) callback(error);
                else callback(null);
            });
        }, function() {
            expect(loseStatus).to.equal(true);
            expect(gamesPlayed).to.equal(1);
            expect(gamesWon).to.equal(0);
            done();
        });
    });
});

describe('Testing winning scenario', function() {
    var sessionID = '', currentWord = '', guesses = [];
    before('start a new game', function(done) {
        var url = domain + "/api/client";
        var options = {
            url : url,
            method : 'GET',
            json : true
        };
        request(options, function(error, response, body) {
            sessionID = body.sessionID;
            currentWord = body.currentWord;
            var guessCount = 0;
            for(var i=97;i<=122;i++) {
                var char = String.fromCharCode(i);
                if(currentWord.includes(char)) {
                    guesses.push(char);
                    if(++guessCount >= 10) break;
                }
            }
            done();
        });
    });

    it('should win when the right letters are guessed', function(done) {
        this.timeout(10000);
        var url = domain + "/api/guess";
        var winStatus = '', gamesPlayed = -1, gamesWon = -1;
        var options = {
            url : url,
            method : 'POST',
            headers : {
                'Cookie' : 'sessionID='+sessionID
            },
            body : {
                guessedLetter : ''
            },
            json : true
        };
        async.eachSeries(guesses, function(letter, callback) {
            options.body.guessedLetter = letter;
            request(options, function(error, response, body) {
                winStatus = body.currWinStatus;
                gamesPlayed = body.gamesPlayed;
                gamesWon = body.gamesWon;
                if(error) callback(error);
                else callback(null);
            });
        }, function() {
            expect(winStatus).to.equal(true);
            expect(gamesPlayed).to.equal(1);
            expect(gamesWon).to.equal(1);
            done();
        });
    });
});