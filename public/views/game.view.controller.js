/**
 * Created by JYOTHIPRASAD on 3/1/2017.
 */
(function() {
    angular
        .module("Hangman")
        .controller("GameController", GameController);

    function GameController(GameService) {
        var vm = this;
        vm.keyEvent = keyEvent
        vm.checkGuess = checkGuess;
        vm.startNewGame = startNewGame;

        function init() {
            vm.alphabet = [];
            vm.error = '';
            for(var i=97;i<=122;i++) {
                vm.alphabet.push(String.fromCharCode(i));
            }
            GameService
                .getClientSession()
                .success(function(client) {
                    initiateGame(client);
                    $(document).ready(function() {
                        document.getElementById('keyEventArea').focus();
                    });
                })
                .error(function(err) {
                    vm.error = err;
                });
        }
        init();

        function keyEvent(event) {
            var key = event.keyCode;
            if((key>96 && key<123) || (key>64 && key<91)) {
                var letter = String.fromCharCode(key);
                checkGuess((letter));
            }
        }

        function checkGuess(letter) {
            GameService
                .updateGuess(letter.toLowerCase())
                .success(function(client) {
                    vm.client = client;
                    if(vm.client.currWinStatus || vm.client.currLoseStatus) {
                        $('#gameOver').modal({keyboard: true});
                    }
                })
                .error(function(err) {
                    vm.error = err;
                });
        }

        function startNewGame(newGame) {
            vm.error = '';
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
            if(!client) {
                vm.error = "You have played all the words available." +
                    " To continue playing, upload a new word set.";
            }
            else {
                vm.client = client;
                vm.currWordArray = client.currentWord.split('');
            }
        }
    }
})();