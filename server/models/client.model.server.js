/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
module.exports = function() {
    var mongoose = require("mongoose");
    var ClientSchema = require("./client.schema.server.js")();
    var ClientModel = mongoose.model("ClientModel", ClientSchema);

    var api = {
        createClientSession     : createClientSession,
        getClientDetails        : getClientDetails
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
};