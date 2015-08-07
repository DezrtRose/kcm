(function() {   

    var newseventsdetailApp = angular.module('kcm-app.controllers');

    newseventsdetailApp.controller('newseventsdetailController', function($scope, $stateParams, $http, CacheFactory) {
        $scope.loadingStatus = true;

        // check for net connection
        $scope.$watch('online', function(newStatus) {
            $scope.netStatus = newStatus;

            self.newsdetailCache = CacheFactory.get("newsdetailCache");
	        cacheKey = $stateParams.newsAlias;
	        newsdetailData = self.newsdetailCache.get(cacheKey);

            if(newStatus == true) { // online
                if(newsdetailData) {
		            $scope.message = newsdetailData;
		            $scope.image = configData.base_url + newsdetailData.image;
		            $scope.loadingStatus = false;
		            console.log("found data in cache", newsdetailData);
		        } else { // cache data absent
                    $scope.fetchajaxData();
                }
            } else { // offline
                $scope.message = newsdetailData;
	            $scope.image = configData.base_url + newsdetailData.image;
	            $scope.loadingStatus = false;
	            console.log("found data in cache", newsdetailData);
            }
        });

        $scope.fetchajaxData = function() {
            return $http({ 
                method: 'GET',
                cache: true,
                url: configData.url + '/get_News_Detail/' + $stateParams.newsAlias
            })
            .success(function(res) {
                $scope.message = res;
                $scope.image = configData.base_url + res.image;
                $scope.loadingStatus = false;

                self.newsdetailCache.put(cacheKey, res);
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
    });
    
}());