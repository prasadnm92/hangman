/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
(function() {
    angular
        .module("Hangman")
        .factory("GameService", GameService);

    function GameService($http) {
        var api = {
            saveClientSession: saveClientSession
        };
        return api;

        function saveClientSession() {
            console.log("in service");
            return $http.get("/test");
        }
    }
})();