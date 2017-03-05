/**
 * Created by JYOTHIPRASAD on 3/1/2017.
 */
module.exports = function(app) {
    var model = require("./models/models.server.js")();
    var cookieParser = require('cookie-parser');
    var expressSession = require('express-session');
    var sessionOptions = {
        cookie: {
            maxAge:  24 * 60 * 60 * 1000    // 1 day in milliseconds
        },
        resave: true,
        rolling: true,                      // maxAge countdown is reset on every request
        saveUninitialized: true,            // forces uninitialized session to be stored
        secret: "some_high_entropy_string"
    };
    app.use(cookieParser());
    app.use(expressSession(sessionOptions));

    require("./services/game.service.server.js")(app, model);
    console.log("server running...");
};