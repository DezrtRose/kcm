var kcmAppMainModule = angular.module("kcm-app", ['ionic',
    'kcm-app.controllers',
    'kcm-app.services',
    'angular-cache',
    'angular.filter'
])

// remove back button text completely
kcmAppMainModule.config(function ($ionicConfigProvider, $cordovaAppRateProvider) {
    $ionicConfigProvider.backButton.previousTitleText(false).text('');

    // rate the app, setting preferences
    document.addEventListener("deviceready", function () {
        var prefs = {
            language: 'en',
            appName: configData.appName,
            iosURL: configData.iOSAppId,
            androidURL: 'market://details?id=' + configData.androidPackageName
        };
        $cordovaAppRateProvider.setPreferences(prefs)
    }, false);
});

kcmAppMainModule.run(function ($ionicPlatform, CacheFactory, $ionicPopup, $rootScope, $window, $cordovaPush, $http, $state) {
    $rootScope.baseUrl = configData.base_url;
    $rootScope.notifications = [];
    $rootScope.loggedEmail = '';
    $rootScope.userType = 'All';

    var config = {},
        isAndroid = ionic.Platform.isAndroid(),
        isIOS = ionic.Platform.isIOS(),
        platform = ionic.Platform.platform(),
        platformVersion = ionic.Platform.version();
    if(isAndroid) {
        config = {
            "senderID": "724496753124"
        };
    } else if(isIOS) {
        config = {
            "badge": true,
            "sound": true,
            "alert": true
        };
    }

    // fresh push notification code
    document.addEventListener("deviceready", function(){
        $cordovaPush.register(config).then(function(result) {
            // Success
            console.log('Register Success', result);
            alert('In register');
            if(isIOS) {
                $rootScope.regid = result;
                alert($rootScope.regid);
                storeDeviceToken();
            }
        }, function(err) {
            // Error
            console.log('Register Unsuccessful', err);
        })

        $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
            switch(notification.event) {
                case 'registered':
                    console.log('$cordovaPush:notificationReceived:registered');
                    if (notification.regid.length > 0 ) {
                        $rootScope.regId = notification.regid;
                        storeDeviceToken();
                    }
                    break;

                case 'message':
                    console.log('$cordovaPush:notificationReceived:message');
                    // this is the actual push notification. its format depends on the data model from the push server
                    if(isAndroid) {
                        handleAndroid(notification);
                    } else if(isIOS) {
                        handleIOS(notification);
                    }
                    break;

                case 'error':
                    console.log('GCM error = ' + notification.msg);
                    break;

                default:
                    console.log('An unknown GCM event has occurred');
                    break;
            }
        });
    }, false);

    // Android Notification Received Handler
    function handleAndroid(notification) {
        // ** NOTE: ** You could add code for when app is in foreground or not, or coming from coldstart here too
        // via the console fields as shown.
        if (notification.event == "registered") {
            $rootScope.regId = notification.regid;
            //alert('In handle Android : ' + $rootScope.regId);
            storeDeviceToken("android", notification.regid);
        } else if (notification.event == "message") {
            if(notification.payload.type == 'LMS') {
                $state.go('user-account');
            } else if(notification.payload.type == 'News') {
                $state.go('news-events');
            }
            // alert(notification.message);
        } else if (notification.event == "error"){
            // alert('error occured');
        } else {
            // alert('nothing happened');
        }
    }

    // IOS Notification Received Handler
    function handleIOS(notification) {
        if (notification.alert) {
            navigator.notification.alert(notification.alert);
        }

        if (notification.sound) {
            var snd = new Media(event.sound);
            snd.play();
        }

        if (notification.badge) {
            $cordovaPush.setBadgeNumber(notification.badge).then(function(result) {
                // Success!
                navigator.notification.alert('Success');
            }, function(err) {
                // An error occurred. Show a message to the user
                navigator.notification.alert('Error');
            });
        }
    }

    // Stores the device token in a db using node-pushserver (running locally in this case)
    //
    // type:  Platform type (ios, android etc)
    function storeDeviceToken() {
        // Create a random userid to store with it
        $http({
            method: 'post',
            url: $rootScope.baseUrl + 'notification-system/register.php',
            data: {
                user_type: $rootScope.userType,
                email: $rootScope.loggedEmail,
                gcm_reg_id: $rootScope.regId,
                platform_type: platform,
                platform_version: platformVersion
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
            .success(function (data, status) {
                console.log("Token stored, device is successfully subscribed to receive push notifications.");
                //alert('success');
            })
            .error(function (data, status) {
                console.log("Error storing device token." + data + " " + status);
                //alert('failed ' + data + '-' + status);
            });

    }

    $ionicPlatform.ready(function () {
        // Check net online/offline
        $rootScope.online = navigator.onLine;
        $window.addEventListener("offline", function () {
            $rootScope.$apply(function () {
                $rootScope.online = false;
            });
        }, false);
        $window.addEventListener("online", function () {
            $rootScope.$apply(function () {
                $rootScope.online = true;
            });
        }, false);

        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }

        CacheFactory("aboutCache", {storageMode: 'localStorage'});
        CacheFactory("aboutsiamCache", {storageMode: 'localStorage'});
        CacheFactory("newseventsCache", {storageMode: 'localStorage'});
        CacheFactory("programsCache", {storageMode: 'localStorage'});
        CacheFactory("admissionCache", {storageMode: 'localStorage'});
        CacheFactory("galleryCache", {storageMode: 'localStorage'});
        CacheFactory("newsdetailCache", {storageMode: 'localStorage'});
        CacheFactory("contactCache", {storageMode: 'localStorage'});
        CacheFactory("userdetailCache", {storageMode: 'localStorage'});
        CacheFactory("useremailCache", {storageMode: 'localStorage'});
        CacheFactory("userpasswordCache", {storageMode: 'localStorage'});
        CacheFactory("lmsDataCache", {storageMode: 'localStorage'});

        self.userEmailCache = CacheFactory.get('useremailCache');
        self.userdetailCache = CacheFactory.get('userdetailCache');
        var userEmail = self.userEmailCache.get('useremail');
        var userDetails = self.userdetailCache.get('userdetail');
        if(userDetails) {
            $rootScope.userType = userDetails.role;
        } else {
            $rootScope.userType = 'All';
        }
        if(userEmail) {
            $rootScope.accountUrl = '#/user-account';
            $rootScope.loggedEmail = userEmail;
        } else {
            $rootScope.accountUrl = '#/account';
        }
    });

})

kcmAppMainModule.config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

        // setup an abstract state for the tabs directive
        .state('home', {
            url: "/home",
            abstract: false,
            templateUrl: "templates/home.html"
        })

        // navigation

        .state('about', {
            url: '/about',
            templateUrl: 'templates/about.html',
            controller: 'aboutController'
        })

        .state('about-siam', {
            url: '/about-siam',
            templateUrl: 'templates/about-siam.html',
            controller: 'aboutsiamController'
        })

        .state('news-events', {
            url: '/news-events',
            templateUrl: 'templates/news-events.html',
            controller: 'newseventsController'
        })

        .state('programs', {
            url: '/programs',
            templateUrl: 'templates/programs.html',
            controller: 'programsController'
        })


        .state('admission', {
            url: '/admission',
            cache: false,
            templateUrl: 'templates/admission.html',
            controller: 'admissionController'
        })

        .state('gallery', {
            url: '/gallery',
            templateUrl: 'templates/gallery.html',
            controller: 'galleryController'
        })

        .state('news-detail', {
            url: '/news-detail/:newsAlias',
            templateUrl: 'templates/news-detail.html',
            controller: 'newseventsdetailController'
        })

        .state('albums', {
            url: '/albums/:albumYear/:albumAlias',
            templateUrl: 'templates/images.html',
            controller: 'imageController'
        })

        .state('account', {
            url: '/account',
            templateUrl: 'templates/account.html',
            controller: 'accountController'
        })

        .state('map', {
            url: '/map',
            templateUrl: 'templates/map.html',
            controller: 'mapController'
        })

        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'loginController'
        })

        .state('contact-us', {
            url: '/contact-us',
            templateUrl: 'templates/contact-us.html',
            controller: 'contactusController'
        })

        .state('user-account', {
            url: '/user-account',
            cache: false,
            params: {detail: null, user_email: null, user_password: null},
            templateUrl: 'templates/user-account.html',
            controller: 'useraccountController'
        })

        .state('lms', {
            url: '/lms',
            templateUrl: 'templates/welcome-lms.html',
            controller: 'welcomeLmsController'
        })

        .state('attendance', {
            url: '/attendance',
            templateUrl: 'templates/attendence.html',
            controller: 'attendanceController'
        })

        .state('take-attendance', {
            url: '/take-attendance',
            templateUrl: 'templates/takeAttendance.html',
            controller: 'takeAttendanceController'
        })

        .state('apply-leave', {
            url: '/apply-leave',
            templateUrl: 'templates/apply-leave.html'
        })

        .state('subjects', {
            url: '/subjects',
            templateUrl: 'templates/my-subject.html',
            controller: 'subjectController'
        })

        .state('groups', {
            url: '/groups',
            templateUrl: 'templates/group-main.html'
        })

        .state('edit-profile', {
            url: '/edit-profile',
            templateUrl: 'templates/edit-profile.html',
            controller: 'editProfileController'
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/home');

});