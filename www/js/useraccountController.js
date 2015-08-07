(function() {   
    "use strict";

    var useraccountApp = angular.module('kcm-app.controllers');

    useraccountApp.controller('useraccountController', function($rootScope, $scope, $stateParams, CacheFactory, $state, $cordovaAppRate) {
        var params = $stateParams.detail;
        var user_email = $stateParams.user_email;
        var user_password = $stateParams.user_password;
        console.log('state params', $stateParams);

        // put user info in localStorage or retrieve from it
        self.userdetailCache = CacheFactory.get("userdetailCache");
        if(params != '') {
            console.log(self.userdetailCache);
            var cacheKey = "userdetail";
            var userdetailData = self.userdetailCache.get(cacheKey);
        }

        if(userdetailData) { // cache data present
            $scope.message = userdetailData;
        } else { // cache data absent
            $scope.message = params;
            self.userdetailCache.put(cacheKey, params);
        }

        // put useremail and userpassword in localStorage or retrieve from it
        self.useremailCache = CacheFactory.get("useremailCache");
        if(user_email != '') {
            cacheKey = "useremail";
            var useremailData = self.useremailCache.get(cacheKey);
        }

        if(useremailData) { // cache data present
            $scope.email = useremailData;
        } else { // cache data absent
            $scope.email = user_email;
            self.useremailCache.put(cacheKey, user_email);
        }

        self.userpasswordCache = CacheFactory.get("userpasswordCache");
        if(user_password != '') {
            cacheKey = "userpassword";
            var userpasswordData = self.userpasswordCache.get(cacheKey);
        }

        if(userpasswordData) { // cache data present
            $scope.password = userpasswordData;
        } else { // cache data absent
            $scope.password = user_password;
            self.userpasswordCache.put(cacheKey, user_password);
        }

        $scope.logout = function() {
            self.lmsDataCache = CacheFactory.get('lmsDataCache');
            self.userdetailCache.destroy();
            self.useremailCache.destroy();
            self.userpasswordCache.destroy();
            self.lmsDataCache.destroy();
            CacheFactory("userdetailCache", {storageMode: 'localStorage'});
            CacheFactory("useremailCache", {storageMode: 'localStorage'});
            CacheFactory("userpasswordCache", {storageMode: 'localStorage'});
            CacheFactory("lmsDataCache", {storageMode: 'localStorage'});
            console.log(self.lmsDataCache, self.userdetailCache, self.useremailCache, self.userpasswordCache);
            $rootScope.accountUrl = '#/account';
            $state.go('account', {}, { reload: true });
        };

        document.addEventListener("deviceready", function () {
            $scope.rateApp = function() {
                $cordovaAppRate.navigateToAppStore().then(function (result) {
                    // success
                    console.log('success');
                });
            }
        }, false);

    });

}());