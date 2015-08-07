(function() {

	var galleryApp = angular.module('kcm-app.controllers');

	galleryApp.controller('galleryController', function($scope, $http, CacheFactory) {
        $scope.loadingStatus = true;
        $scope.baseUrl = configData.base_url;

        // check for net connection
        $scope.$watch('online', function(newStatus) {
            $scope.netStatus = newStatus;

            self.galleryCache = CacheFactory.get("galleryCache");
            cacheKey = "gallery";
            galleryData = self.galleryCache.get(cacheKey);

            if(newStatus == true) { // online
                if(galleryData) { // cache data present
                    $scope.message = galleryData;
                    $scope.loadingStatus = false;
                    console.log("found data in cache", galleryData);
                } else { // cache data absent
                    $scope.fetchajaxData();
                }
            } else { // offline
                $scope.message = galleryData;
                $scope.loadingStatus = false;
                console.log("found data in cache", galleryData);
            }
        });

        $scope.fetchajaxData = function() {
            return $http({ 
                method: 'GET',
                cache: true,
                url: configData.url + '/get_Gallery'
            })
            .success(function(res) {
                $scope.message = res;
                $scope.loadingStatus = false;

                self.galleryCache.put(cacheKey, res);
                console.log('fresh data', $scope.message);
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

        $scope.toggleGroup = function(group) {
            if ($scope.isGroupShown(group)) {
                $scope.shownGroup = null;
            } else {
                $scope.loadingStatus1 = true;
                $scope.errors = false;
                $scope.shownGroup = group;
                
                $scope.message1 = $http({ 
                    method: 'GET',
                    cache: true,
                    url: configData.url + '/get_Gallery_Albums/' + group
                })
                .success(function(res) {
                    $scope.message1 = res;
                    $scope.loadingStatus1 = false;

                })
                .error(function (data) {
                    console.log("ERROR: " + data);
                    if(data == null) {
                        $scope.errors = true;
                        $scope.errorMessage = 'You are Offline';
                        $scope.loadingStatus1 = false;
                    }
                });
            }
        };
        $scope.isGroupShown = function(group) {
            return $scope.shownGroup === group;
        };
    });

}());