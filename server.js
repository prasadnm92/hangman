/**
 * Created by JYOTHIPRASAD on 3/1/2017.
 */
var express = require('express');
var bodyParser = require('body-parser');

/*creating an express app*/
var app = express();

/*use body-parser library to extract data from URL*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//configure a public directory to hold the static content
app.use(express.static(__dirname + '/public'));

/*run the node app*/
require("./server/app.js")(app);

var port = process.env.NODEJS_PORT || 3000;

//start listening on port
var server = app.listen(port);
console.log("Listening on port...");

module.exports.closeServer = function() {
    server.close();
};