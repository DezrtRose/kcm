(function() {

	var programsApp = angular.module('kcm-app.controllers');

	programsApp.controller('programsController', function($scope, $http, CacheFactory) {
        $scope.loadingStatus = true;
        $scope.baseUrl = configData.base_url;

        // check for net connection
        $scope.$watch('online', function(newStatus) {
            $scope.netStatus = newStatus;

            self.programsCache = CacheFactory.get("programsCache");
            cacheKey = "programs";
            programsData = self.programsCache.get(cacheKey);

            if(newStatus == true) { // online
                if(programsData) { // cache data present
                    $scope.message = programsData;
                    $scope.BBAF = $scope.message[0].description;
                    $scope.BBAM = $scope.message[1].description;
                    $scope.loadingStatus = false;
                    console.log("found data in cache", programsData);

                    angular.forEach($scope.message, function(filterObj , filterKey) {
                        filterObj.buttonClass = "";
                        filterObj.isVisible = false;
                    });

                    $scope.message[0].buttonClass = "button-positive";
                    $scope.message[0].isVisible = true;
                } else {// cache data absent
                    $scope.fetchajaxData();
                }
            } else { // offline
                $scope.message = programsData;
                $scope.loadingStatus = false;
                console.log("found data in cache", programsData);

                angular.forEach($scope.message, function(filterObj , filterKey) {
                    filterObj.buttonClass = "";
                    filterObj.isVisible = false;
                });

                $scope.message[0].buttonClass = "button-positive";
                $scope.message[0].isVisible = true;
            }
        });

        $scope.fetchajaxData = function() {
            return $http({
                method: 'GET',
                cache: true,
                url: configData.url + '/get_Programs_Data'
            })
            .success(function(res) {
                $scope.message = res;
                $scope.loadingStatus = false;

                self.programsCache.put(cacheKey, res);
                console.log('fresh data', $scope.message);
                    $scope.BBAF = $scope.message[0].description;
                    $scope.BBAM = $scope.message[1].description;

                angular.forEach($scope.message, function(filterObj , filterKey) {
                    $scope.string = $scope.message[0].files;
                    $scope.arrString = new Array();
                    $scope.arrString = $scope.string.split(',');

                    $scope.string1 = $scope.message[0].file_title;
                    $scope.arrString1 = new Array();
                    $scope.arrString1 = $scope.string1.split(',');

                    filterObj.buttonClass = "";
                    filterObj.isVisible = false;
                });

                $scope.string = $scope.message[0].files;
                $scope.arrString = new Array();
                $scope.arrString = $scope.string.split(',');

                $scope.string1 = $scope.message[0].file_title;
                $scope.arrString1 = new Array();
                $scope.arrString1 = $scope.string1.split(',');

                //$scope.message[0].buttonClass = "button-positive";
                $scope.message[0].isVisible = true;
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
        
     
        /*$scope.onSlideMove = function(data){
            console.log(data);
            angular.forEach($scope.message, function(filterObj , filterKey) {
                if(data.index == filterKey) {
                    filterObj.isVisible = true;
                } else {
                    filterObj.isVisible = false;
                }
            });
        };*/
    });
}());