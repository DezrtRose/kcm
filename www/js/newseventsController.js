(function() {

	var newseventsApp = angular.module('kcm-app.controllers');

	newseventsApp.controller('newseventsController', function($scope, $http, CacheFactory) {
        $scope.loadingStatus = true;
        $scope.baseUrl = configData.base_url;

        // check for net connection
        $scope.$watch('online', function(newStatus) {
            $scope.netStatus = newStatus;

            self.newseventsCache = CacheFactory.get("newseventsCache");
            cacheKey = "newsevents";
            newseventsData = self.newseventsCache.get(cacheKey);

            if(newStatus == true) { // online
                if(newseventsData) {
                    $scope.message = newseventsData;
                    $scope.loadingStatus = false;
                    console.log("found data in cache", newseventsData);
                } else { // cache data absent
                    $scope.fetchajaxData();
                }
            } else { // offline
                $scope.message = newseventsData;
                $scope.loadingStatus = false;
                console.log("found data in cache", newseventsData);
            }
        });

        $scope.fetchajaxData = function() {
            return $http({ 
                method: 'GET',
                cache: true,
                url: configData.url + '/get_News_Events'
            })
            .success(function(res) {
                $scope.message = res;
                $scope.loadingStatus = false;

                self.newseventsCache.put(cacheKey, res);
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