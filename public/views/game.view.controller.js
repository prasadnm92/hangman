/**
 * Created by JYOTHIPRASAD on 3/1/2017.
 */
(function() {
    angular
        .module("Hangman")
        .controller("GameController", GameController);

    function GameController() {
        var vm = this;
        vm.hello="World!";
    }
})();