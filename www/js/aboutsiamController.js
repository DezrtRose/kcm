(function() {

	var aboutsiamApp = angular.module('kcm-app.controllers');

	aboutsiamApp.controller('aboutsiamController', function($scope, $http, CacheFactory) {
        $scope.loadingStatus = true;

        // check for net connection
        $scope.$watch('online', function(newStatus) {
            $scope.netStatus = newStatus;

            self.aboutsiamCache = CacheFactory.get("aboutsiamCache");
            cacheKey = "aboutSiam";
            aboutSiamData = self.aboutsiamCache.get(cacheKey);

            if(newStatus == true) { // online
                if(aboutSiamData) { // cache data present
                    $scope.message = aboutSiamData;
                    $scope.image = configData.base_url + aboutSiamData.image;
                    $scope.loadingStatus = false;
                    console.log("found data in cache", aboutSiamData);
                } else { // cache data absent
                    $scope.fetchajaxData();
                }
            } else { // offline
                $scope.message = aboutSiamData;
                $scope.image = configData.base_url + aboutSiamData.image;
                $scope.loadingStatus = false;
                console.log("found data in cache", aboutSiamData);
            }
        });

        $scope.fetchajaxData = function() {
            return $http({ 
                method: 'GET',
                cache: true,
                url: configData.url + '/get_About_Siam_Data'
            })
            .success(function(res) {
                $scope.message = res;
                $scope.image = configData.base_url + res.image;
                $scope.loadingStatus = false;

                self.aboutsiamCache.put(cacheKey, res);
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

} ());