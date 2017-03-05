/**
 * Created by JYOTHIPRASAD on 3/1/2017.
 */
(function() {
    angular
        .module("Hangman")
        .controller("GameController", GameController);

    function GameController(GameService) {
        var vm = this;
        vm.checkGuess = checkGuess;
        vm.startNewGame = startNewGame;

        function init() {
            vm.alphabet = [];
            for(var i=97;i<=122;i++) {
                vm.alphabet.push(String.fromCharCode(i));
            }
            GameService
                .getClientSession()
                .success(function(client) {
                    initiateGame(client);
                })
                .error(function(err) {
                    vm.error = err;
                });
        }
        init();

        function checkGuess(letter) {
            GameService
                .updateGuess(letter.toLowerCase())
                .success(function(client) {
                    vm.client = client;
                    if(vm.client.currWinStatus || vm.client.currLoseStatus) {
                        $('#gameOver').modal('show');
                    }
                })
                .error(function(err) {
                    vm.error = err;
                });
        }

        function startNewGame(newGame) {
            if(newGame) {
                GameService
                    .startNewGame()
                    .success(function(client) {
                        initiateGame(client);
                    })
                    .error(function(err) {
                        vm.error = err;
                    });
            }
        }

        function initiateGame(client) {
            vm.client = client;
            vm.currWordArray = client.currentWord.split('');
        }
    }
})();