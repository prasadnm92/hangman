/**
 * Created by JYOTHIPRASAD on 3/2/2017.
 */
(function() {
    angular
        .module("Hangman")
        .factory("GameService", GameService);

    function GameService($http) {
        var api = {
            getClientSession    : getClientSession,
            updateGuess         : updateGuess,
            startNewGame        : startNewGame
        };
        return api;

        function getClientSession() {
            return $http.get("/api/client");
        }

        function updateGuess(guessedLetter) {
            return $http.post("/api/guess",{guessedLetter: guessedLetter});
        }

        function startNewGame() {
            return $http.post("/api/game");
        }
    }
})();