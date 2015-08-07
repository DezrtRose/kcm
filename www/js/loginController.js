(function() {
    "use strict";

    var loginApp = angular.module('kcm-app.controllers');

    loginApp.controller('loginController', function($rootScope, $scope, $http, $state, $cordovaToast) {
        console.log('in login');
        $scope.user = {};
        var defaultForm = {
            email : "",
            password : ""
        };

        // Set the default value of inputType for password and hide-show text
        $scope.inputType = 'password';
        $scope.hideshowText = 'Show Password';
  
        // Hide & show password function
        $scope.hideShowPassword = function(){
            if ($scope.inputType == 'password') {
                $scope.inputType = 'text';
                $scope.hideshowText = 'Hide Password';
            } else {
                $scope.inputType = 'password';
                $scope.hideshowText = 'Show Password';
            }
        };
        
        // check for net connection
        $scope.$watch('online', function(newStatus) {
            $scope.netStatus = newStatus;

            if(newStatus == false) { // offline
                $scope.error = true;
                $scope.message = 'You are offline. Check your net connection.';
            } else { // online
                $scope.submitForm = function(form) {
                    if(form.$valid) { // form is valid
                        $scope.loadingStatus = true;
                        var post_email = $scope.user.email;
                        var post_password = $scope.user.password;
                        $scope.fetchajaxData(post_email, post_password);
                    }
                }
            }
        });

        $scope.fetchajaxData = function(post_email, post_password) {
            var params = { 
                "api_key": configData.lms_api,
                "username" : post_email,
                "password" : post_password,
                "information" : configData.lms_info_login
            }
            
            $http.post(configData.lms_url, params)
            .success(function(res) {
                $scope.loadingStatus = false;
                if(res.result == 'Successful') {
                    $rootScope.accountUrl = '#/user-account';
                    console.log('login controller', {detail: $scope.message, user_email: post_email, user_password: post_password});
                    $scope.error = false;
                    $scope.message = res.user_details;
                    $scope.user = defaultForm;
                    $state.go('user-account', {detail: $scope.message, user_email: post_email, user_password: post_password},  { reload: true });
                } else {
                    $scope.error = true;
                    $scope.message = res.result;
                    $scope.showToast('Login Failed', 'long', 'bottom');
                    $scope.user = defaultForm; // clear form
                }
            })
            .error(function (data) {
                $scope.loadingStatus = false;
                console.log("ERROR: " + data);
                $scope.user = defaultForm; // clear form
            });
        };

        $scope.showToast = function(message, duration, location) {
            $cordovaToast.show(message, duration, location).then(function(success) {
                console.log("The toast was shown");
            }, function (error) {
                console.log("The toast was not shown due to " + error);
            });
        };
    });

}());