(function(){

    var kcmApp = angular.module('kcm-app.controllers', ['ionic', 'ngCordova', 'tabSlideBox']);

    // directive for active class
    kcmApp.directive('activeLink', ['$location', function(location) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs, controller) {
                var clazz = attrs.activeLink;
                var path = attrs.href;
                path = path.substring(1); //hack because path does not return including hashbang
                scope.location = location;
                scope.$watch('location.path()', function(newPath) {
                    if (path === newPath) {
                        element.addClass(clazz);
                    } else {
                        element.removeClass(clazz);
                    }
                });
            }
        };
    }]);

    // create the controller and inject Angular's $scope
    kcmApp.controller('mainController', function($scope, $http) {});

    kcmApp.controller('imageController', function($scope, $stateParams, $http, $ionicModal, $ionicSlideBoxDelegate, CacheFactory) {
        $scope.loadingStatus = true;
        $scope.baseUrl = configData.base_url;

        $http({ 
            method: 'GET',
            url: configData.url + '/get_Album_Images/' + $stateParams.albumYear + '/' + $stateParams.albumAlias
        })
        .success(function(res) {
            $scope.message = res;
            $scope.albumTitle = $scope.message[0].album_name;
            
            $scope.loadingStatus = false;
        })
        .error(function (data) {
            console.log("ERROR: " + data);
            if(data == 'null') {
                $scope.errorMessage = 'You are Offline';
            }

            $scope.loadingStatus = false;
        });

        $ionicModal.fromTemplateUrl('image-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.openModal = function() {
            $ionicSlideBoxDelegate.slide(0);
            $scope.modal.show();
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });

        // Call this functions if you need to manually control the slides
        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
      
        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };
      
        $scope.goToSlide = function(index) {
            $scope.modal.show();
            $ionicSlideBoxDelegate.slide(index);
        }
      
        // Called each time the slide changes
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };
    })

    kcmApp.controller('mapController', function($scope, $ionicLoading, $compile) {
        
        function initialize() {
            var myLatlng = new google.maps.LatLng(27.66318,85.33025);
            
            var mapOptions = {
              center: myLatlng,
              zoom: 16,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("map"), mapOptions);
            
            //Marker + infowindow + angularjs compiled ng-click
            var contentString = "<div>Gwarko, Lalitpur, Nepal</div>";
            var compiled = $compile(contentString)($scope);

            var infowindow = new google.maps.InfoWindow({
                content: compiled[0]
            });

            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title: 'Kathmandu College of Management'
            });

            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map,marker);
            });

            $scope.map = map;
        }
        //google.maps.event.addDomListener(window, 'load', initialize);
        initialize();
    });

    kcmApp.controller('socialController', function($scope, $ionicActionSheet, $window) {

        $scope.showActionsheet  = function() {
            $ionicActionSheet.show({
                titleText: 'Social',
                buttons: [
                    { text: '<i class="icon ion-social-facebook"></i> Facebook' },
                    { text: '<i class="icon ion-social-twitter"></i> Twitter' },
                    { text: '<i class="icon ion-social-linkedin"></i> Linkedin'},
                    { text: '<i class="icon ion-social-youtube"></i> Youtube' }
                ],
                cancelText: 'Cancel',
                buttonClicked: function(index) {
                    if(index == '0') {
                        window.open("https://www.facebook.com/kcmnepal", "_system", "location=yes");
                    } else if(index == '1') {
                        window.open("https://twitter.com/kcmtweet", "_system", "location=yes");
                    } else if(index == '2') {
                        window.open("https://www.linkedin.com/company/3859432?trk=tyah&trkInfo=idx%3A1-1-1%2CtarId%3A1416898988028%2Ctas%3Akathmandu+college+of+management", "_system", "location=yes");
                    }else {
                        window.open("http://www.youtube.com/channel/UCEPm8QBiVAJArvL7N4BtpsA", "_system", "location=yes");
                    }
                    return true;
                }
            });
            
        }
    })

}());