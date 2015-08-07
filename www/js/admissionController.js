(function() {

	var admissionApp = angular.module('kcm-app.controllers');

	admissionApp.controller('admissionController', function($scope, $http, CacheFactory, $cordovaFileTransfer, $timeout, $cordovaToast, $cordovaProgress) {
        $scope.loadingStatus = true;
        $scope.baseUrl = configData.base_url;

        // check for net connection
        $scope.$watch('online', function(newStatus) {
            $scope.netStatus = newStatus;

            self.admissionCache = CacheFactory.get("admissionCache");
            cacheKey = "admission";
            admissionData = self.admissionCache.get(cacheKey);

            if(newStatus == true) { // online
                if(admissionData) { // cache data present
                    $scope.message = admissionData;
                    $scope.AI = $scope.message[0].description;
                    $scope.KCMS = $scope.message[1].description;
                    $scope.loadingStatus = false;

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

                    $scope.message[0].buttonClass = "button-positive";
                    $scope.message[0].isVisible = true;
                    console.log("found data in cache", admissionData);
                } else { // cache data absent
                    $scope.fetchajaxData();
                }
            } else { // offline
                $scope.message = admissionData;
                $scope.loadingStatus = false;

                angular.forEach($scope.message, function(filterObj , filterKey) {
                    filterObj.buttonClass = "";
                    filterObj.isVisible = false;
                });

                $scope.message[0].buttonClass = "button-positive";
                $scope.message[0].isVisible = true;
                console.log("found data in cache", admissionData);
                $scope.AI = $scope.message[0].description;
                $scope.KCMS = $scope.message[1].description;
            }
        });

        $scope.fetchajaxData = function() {
            return $http({ 
                method: 'GET',
                cache: true,
                url: configData.url + '/get_Admission_Data'
            })
            .success(function(res) {
                $scope.message = res;
                $scope.loadingStatus = false;

                self.admissionCache.put(cacheKey, res);
                console.log('fresh data', $scope.message);
                    $scope.AI = $scope.message[0].description;
                    $scope.KCMS = $scope.message[1].description;

                angular.forEach($scope.message, function(filterObj , filterKey) {
                    filterObj.buttonClass = "";
                    filterObj.isVisible = false;
                });

                $scope.message[0].buttonClass = "button-positive";
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

        $scope.switchTab = function (tabsId) {
            angular.forEach($scope.message, function(filterObj , filterKey) {
                    if(filterObj.id == tabsId) {
                        filterObj.buttonClass = "button-positive";
                        filterObj.isVisible = true;
                    } else {
                        if(filterObj.buttonClass != "") {
                            filterObj.buttonClass = "";
                        }
                    if(filterObj.isVisible == true) {
                        filterObj.isVisible = false;
                    }
                }
            });       
        }  
        
           $scope.download_file = function(file)   {
                var url = file;
               var fileName = url.split("/").pop();
                var targetPath = cordova.file.externalRootDirectory + '/kcm/' + fileName;
                var trustHosts = true;
                var options = {};
               //$scope.showToast('Download Started', 'short', 'bottom');
               $cordovaProgress.show('Downloading...');
                $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                  .then(function(result) {
                        $cordovaProgress.hide();
                        $scope.showToast('Downloaded Successfully at ' + targetPath, 'long', 'bottom');
                  }, function(err) {
                        $cordovaProgress.hide();
                        console.log(url);
                        console.log(targetPath);
                        console.log(trustHosts);
                    console.log(err);
                  }, function (progress) {
                        /*$timeout(function () {
                            var progressUpdate = (progress.loaded / progress.total) * 100;
                            $cordovaProgress.showSimple(true);
                            $cordovaProgress.hide();
                            //$cordovaProgress.showBarWithLabel(false, progressUpdate, "Downloading...");
                        })*/
                  });
            };

        $scope.showToast = function(message, duration, location) {
            $cordovaToast.show(message, duration, location).then(function(success) {
                console.log("The toast was shown");
            }, function (error) {
                console.log("The toast was not shown due to " + error);
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