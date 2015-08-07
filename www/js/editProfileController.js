(function() {

    var attendanceApp = angular.module('kcm-app.controllers');

    attendanceApp.controller('editProfileController', function($scope, $http, CacheFactory, $q, $cordovaToast) {
        $scope.loadingStatus = false;
        $scope.baseUrl = configData.base_url;
        $scope.editProfile = {
            email: '',
            name: '',
            secEmail: '',
            address: '',
            phone: ''
        };

        self.userDataCache = CacheFactory.get('userdetailCache');
        self.userEmailCache = CacheFactory.get('useremailCache');
        self.userPasswordCache = CacheFactory.get('userpasswordCache');

        var userDetails = self.userDataCache.get('userdetail');
        var userEmail = self.userEmailCache.get('useremail');
        var userPassword = self.userPasswordCache.get('userpassword');
        if(userDetails && userEmail) {
            $scope.editProfile.name = userDetails.full_name;
            $scope.editProfile.email = userEmail;
            $scope.editProfile.secEmail = userDetails.secondary_email;
            $scope.editProfile.address = userDetails.address;
            $scope.editProfile.phone = userDetails.phone;
        }

        $scope.saveProfile = function() {
            var params = {
                "api_key": configData.lms_api,
                "username" : userEmail,
                "password" : userPassword,
                "information" : 'change_profile_details',
                "new_address" : $scope.editProfile.address,
                "new_phone_number" : $scope.editProfile.phone,
                "new_secondary_email" : $scope.editProfile.secEmail
            };
            var request = $http({
                method: 'post',
                url: configData.lms_update_url,
                data: params
            });
            request.success(function(data) {
                $scope.loadingStatus = false;
                console.log({success : data});
                $scope.showToast('Profile Saved', 'long', 'bottom');
                getLmsData(userDetails, configData.lms_info_login, 'userdetail', true)
                    .then(function(data) {
                        userDetails = data.user_details;
                    });
            });
            request.error(function(log) {
                $scope.loadingStatus = false;
                console.log({error : log});
                $scope.showToast('Profile Could Not Be Saved', 'long', 'bottom');
                getLmsData(userDetails, configData.lms_info_login, 'userdetail', true)
                    .then(function(data) {
                        userDetails = data.user_details;
                    });
            });
        };

        /* Getting data form LMS API */
        function getLmsData (currentCacheData, functionName, dataCacheKey, forceRefresh) {
            var deferred = $q.defer();
            self.userpasswordCache = CacheFactory.get("userpasswordCache");
            var cacheKey = "userpassword";
            var userpassword = self.userpasswordCache.get(cacheKey);

            self.useremailCache = CacheFactory.get("useremailCache");
            var cacheKey = "useremail";
            var useremail = self.useremailCache.get(cacheKey);

            if(typeof (currentCacheData) === 'undefined' || typeof (forceRefresh) != 'undefined') {
                var params = {
                    "api_key": configData.lms_api,
                    "username" : useremail,
                    "password" : userpassword,
                    "information" : functionName
                };
                $http.post(configData.lms_url, params)
                    .success(function(data) {
                        $scope.loadingStatus = false;
                        self.userDataCache.put(dataCacheKey, data.user_details);
                        deferred.resolve(data);
                    })
                    .error(function(log) {
                        $scope.loadingStatus = false;
                        deferred.reject();
                        console.log({error : log});
                    });
            }
            return deferred.promise;
        }
        /* Getting data form LMS API */

        $scope.showToast = function(message, duration, location) {
            $cordovaToast.show(message, duration, location).then(function(success) {
                console.log("The toast was shown");
            }, function (error) {
                console.log("The toast was not shown due to " + error);
            });
        };
    });

}());