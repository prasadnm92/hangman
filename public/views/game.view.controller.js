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
            vm.alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G',
                'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
                'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            GameService
                .getClientSession()
                .success(function(client) {
                    console.log(client);
                    vm.client = client;
                })
                .error(function(err) {
                    vm.error = err;
                });
        }
        init();

        function checkGuess(letter) {
            vm.guesses.push(letter);
            console.log(letter);
        }
    }
})();