/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
(function() {
    angular
        .module("Hangman")
        .factory("GameService", GameService);

    function GameService($http) {
        var api = {
            getClientSession: getClientSession
        };
        return api;

        function getClientSession() {
            return $http.get("/api/client");
        }
    }
})();