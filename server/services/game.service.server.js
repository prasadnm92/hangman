/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
module.exports = function(app, model) {

    app.get("/test", saveClientSession);

    function saveClientSession(req, res) {
        var sessionId = req.sessionId;
        console.log("sessionId: "+req.sessionId);
        console.log("session.id: "+req.session.id);
        console.dir(req.session);
        res.send(req.session);
    }
};