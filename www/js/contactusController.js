(function() {   

    var contactusApp = angular.module('kcm-app.controllers');

    contactusApp.controller('contactusController', function($scope, $http, CacheFactory) {
        $scope.loadingStatus = true;
        var defaultForm = {
            name : "",
            email : "",
            message : ""
        };
        $scope.contact = defaultForm;

        $scope.submitForm = function(form) {
            if(form.$valid) { // form is valid
                $scope.loadingStatus = true;
                var post_email = $scope.contact.email;
                var post_name = $scope.contact.name;
                var post_message = $scope.contact.message;
                $scope.sendMessage(post_name, post_email, post_message);
            }
        }

        $scope.sendMessage = function(name, email, message) {
            var params = {
                "name" : name,
                "email" : email,
                "message" : message
            };

            var request = $http({
                method: 'post',
                url: configData.base_url + 'contact_mobile',
                data: {
                    name: name,
                    email: email,
                    message: message
                },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            request.success(function(data) {
                $scope.loadingStatus = false;
                $scope.contact.email = '';
                $scope.contact.name = '';
                $scope.contact.message = '';
                console.log('data', data);
            });
        };

        // check for net connection
        $scope.$watch('online', function(newStatus) {
            $scope.netStatus = newStatus;

            self.contactCache = CacheFactory.get("contactCache");
            cacheKey = "contactus";
            contactusData = self.contactCache.get(cacheKey);

            if(newStatus == true) { // online
                if(contactusData) { // cache data present
                    $scope.message = contactusData;
                    $scope.loadingStatus = false;
                    console.log("found data in cache", contactusData);
                } else { // cache data absent
                    $scope.fetchajaxData();
                }
            } else { // offline
                $scope.message = contactusData;
                $scope.loadingStatus = false;
                console.log("found data in cache", contactusData);
            }
        });

        $scope.fetchajaxData = function() {
            return $http({ 
                method: 'GET',
                cache: true,
                url: configData.url + '/get_Contact_Data'
            })
            .success(function(res) {
                $scope.message = res;
                $scope.loadingStatus = false;

                self.contactCache.put(cacheKey, res);
                console.log("fresh data", $scope.message);
            })
            .error(function (data) {
                console.log("ERROR: " + data);
            });
        }

        $scope.doRefresh = function () {
            console.log('refresh');
            $scope.fetchajaxData().then(function(){
                $scope.$broadcast('scroll.refreshComplete');
            });    
        };
    });

}());