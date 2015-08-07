(function() {
    "use strict";

    var welcomeLmsApp = angular.module('kcm-app.controllers');

    welcomeLmsApp.controller('welcomeLmsController', function($scope, CacheFactory) {
        $scope.teacher = false;
        self.userDetailCache = CacheFactory.get("userdetailCache");
        var userDetails = self.userDetailCache.get('userdetail');
        if(userDetails) {
            if(userDetails.role == 'Teacher') {
                $scope.teacher = true;
            } else if(userDetails.role == 'Student') {
                $scope.student = true;
            }
        }
    });

}());