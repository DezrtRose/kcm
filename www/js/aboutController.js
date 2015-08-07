(function() {   

    var aboutApp = angular.module('kcm-app.controllers');

    aboutApp.controller('aboutController', function($scope, $http, CacheFactory) {
        $scope.loadingStatus = true;
        
        // check for net connection
        $scope.$watch('online', function(newStatus) {
            $scope.netStatus = newStatus;

            self.aboutCache = CacheFactory.get("aboutCache");
            cacheKey = "about";
            aboutData = self.aboutCache.get(cacheKey);

            if(newStatus == true) { // online
                if(aboutData) { // cache data present
                    $scope.message = aboutData;
                    $scope.image = configData.base_url + aboutData.image;
                    $scope.loadingStatus = false;
                    console.log("found data in cache", aboutData);
                } else { // cache data absent
                    $scope.fetchajaxData();
                }
            } else { // offline
                $scope.message = aboutData;
                $scope.image = configData.base_url + aboutData.image;
                $scope.loadingStatus = false;
                console.log("found data in cache", aboutData);
            }
        });

        $scope.fetchajaxData = function() {
            return $http({ 
                method: 'GET',
                cache: true,
                url: configData.url + '/get_About_Data'
            })
            .success(function(res) {
                $scope.message = res;
                $scope.image = configData.base_url + res.image;
                $scope.loadingStatus = false;

                self.aboutCache.put(cacheKey, res);
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