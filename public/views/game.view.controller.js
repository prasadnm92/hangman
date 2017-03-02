/**
 * Created by JYOTHIPRASAD on 3/1/2017.
 */
(function() {
    angular
        .module("Hangman")
        .controller("GameController", GameController);

    function GameController() {
        var vm = this;
        vm.guesses = [];
        vm.checkGuess = checkGuess;

        function init() {
            vm.wrongGuesses = 0;
            vm.alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G',
                'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
                'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        }
        init();

        function checkGuess(letter) {
            vm.guesses.push(letter);
            console.log(letter);
        }
    }
})();