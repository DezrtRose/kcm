(function() {
	"use strict";

	var accountApp = angular.module('kcm-app.controllers');

	accountApp.controller('accountController', function($scope, CacheFactory, $state, $location) {
        console.log('herer');
        self.useremailCache = CacheFactory.get("useremailCache");
        var cacheKey = "useremail";
        var useremailData = self.useremailCache.get(cacheKey);

        if(typeof useremailData === 'undefined') { // logged in
            $scope.url = 'login';
            $scope.showText = 'Log In';
        }
        $state.reload();
        $scope.reload = function() {
            console.log('fdsf');

            //$state.reload();
        };

	});

}());