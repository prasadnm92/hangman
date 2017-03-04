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

        function init() {
            vm.alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g',
                'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q',
                'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            GameService
                .getClientSession()
                .success(function(client) {
                    vm.client = client;
                    vm.currWordArray = client.currentWord.split('');
                })
                .error(function(err) {
                    vm.error = err;
                });
        }
        init();

        function checkGuess(letter) {
            GameService
                .updateGuess(letter.toLowerCase())
                .success(function(response) {
                    vm.client = response.client;
                    vm.winStatus = response.winStatus;
                    vm.loseStatus = response.loseStatus;
                })
                .error(function(err) {
                    vm.error = err;
                });
        }
    }
})();