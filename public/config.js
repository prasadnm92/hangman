/**
 * Created by JYOTHIPRASAD on 3/1/2017.
 */
(function() {
    angular
        .module("Hangman")
        .config(Config);

    function Config($routeProvider) {
        $routeProvider
            .when("/game", {
                templateUrl: "views/game.view.client.html",
                controller: "GameController",
                controllerAs: "model"
            })
            .otherwise({
                redirectTo: "/game"
            });
    }
})();