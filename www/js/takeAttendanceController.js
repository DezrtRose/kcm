(function() {
    "use strict";

    var takeAttendanceApp = angular.module('kcm-app.controllers');

    takeAttendanceApp.controller('takeAttendanceController', function($scope, CacheFactory, $q, $http) {
        $scope.loadingStatus = true;
        $scope.baseUrl = configData.base_url;
        self.lmsDataCache = CacheFactory.get("lmsDataCache");
        $scope.attendance = {subjectName : '', date: ''};

        /* Getting subjects data */
        var subjectsCacheKey = "subjects",
            subjectsData = self.lmsDataCache.get(subjectsCacheKey);
        getLmsData(subjectsData, configData.lms_subject, subjectsCacheKey)
            .then(function(data) {
                subjectsData = data;
            });
        /* Getting subjects data */

        // check for net connection
        $scope.$watch('online', function(newStatus) {
            $scope.netStatus = newStatus;

            if(newStatus == true) { // online
                if(subjectsData && subjectsData.result != 'Not a user') {
                    $scope.loadingStatus = false;
                    $scope.subjects = _.filter(subjectsData.user_subjects.profile.sessions, {session_status: 'Active'});
                } else {
                    getLmsData(subjectsData, configData.lms_subject, subjectsCacheKey, true)
                        .then(function(data) {
                            $scope.subjects = _.filter(data.user_subjects.profile.sessions, {session_status: 'Active'});
                        });
                }
            } else { // offline
                $scope.subjects = _.filter(subjectsData.user_subjects.profile.sessions, {session_status: 'Active'});
                console.log('Offline from cache');
            }
        });

        /* Setting Attendance for Student */
        function setAttendance (functionName, attendanceDate, sessionId, attendanceDayId, attendanceId, attendanceStatus) {
            if(typeof attendanceDayId == 'undefined') {
                attendanceDayId = '';
            }
            if(typeof attendanceId == 'undefined') {
                attendanceId = '';
            }
            if(typeof attendanceStatus == 'undefined') {
                attendanceStatus = 'true';
            }
            var deferred = $q.defer();
            self.userpasswordCache = CacheFactory.get("userpasswordCache");
            var cacheKey = "userpassword";
            var userpassword = self.userpasswordCache.get(cacheKey);

            self.useremailCache = CacheFactory.get("useremailCache");
            var cacheKey = "useremail";
            var useremail = self.useremailCache.get(cacheKey);

            var date = new Date(attendanceDate);
            var day = date.getDate();
            var monthIndex = date.getMonth() + 1;
            var year = date.getFullYear();
            var formattedDate = year + '-' + monthIndex + '-' + day;

            var params = {
                "api_key": configData.lms_api,
                "username" : useremail,
                "password" : userpassword,
                "information" : functionName,
                "session_id" : sessionId,
                "date" : formattedDate,
                "attendance_day_id" : attendanceDayId,
                "attendance_id" : attendanceId,
                "status" : attendanceStatus
            };
            $http.post(configData.lms_take_attendance_url, params)
                .success(function(data) {
                    $scope.loadingStatus = false;
                    self.lmsDataCache.put(functionName, data);
                    deferred.resolve(data);
                })
                .error(function(log) {
                    $scope.loadingStatus = false;
                    deferred.reject();
                    console.log('Error ', log);
                });

            return deferred.promise;
        }
        /* Setting Attendance for Student */

        /* Getting data form LMS API */
        function getLmsData (currentCacheData, functionName, dataCacheKey, forceRefresh) {
            var deferred = $q.defer();
            self.userpasswordCache = CacheFactory.get("userpasswordCache");
            var cacheKey = "userpassword";
            var userpassword = self.userpasswordCache.get(cacheKey);

            self.useremailCache = CacheFactory.get("useremailCache");
            var cacheKey = "useremail";
            var useremail = self.useremailCache.get(cacheKey);

            if(typeof (currentCacheData) === 'undefined' || typeof (forceRefresh) != 'undefined') {
                var params = {
                    "api_key": configData.lms_api,
                    "username" : useremail,
                    "password" : userpassword,
                    "information" : functionName
                };
                $http.post(configData.lms_url, params)
                    .success(function(data) {
                        $scope.loadingStatus = false;
                        self.lmsDataCache.put(dataCacheKey, data);
                        deferred.resolve(data);
                    })
                    .error(function(log) {
                        $scope.loadingStatus = false;
                        deferred.reject();
                        console.log('Error ', log);
                    });
            }
            return deferred.promise;
        }
        /* Getting data form LMS API */

        $scope.takeAttendance = function() {
            $scope.loadingStatus = true;
            var sessionId = $scope.attendance.subjectName,
                attendanceDate = $scope.attendance.date;

            setAttendance(configData.lms_take_attendance, attendanceDate, sessionId)
                .then(function(data) {
                    var attendanceId = data;
                    console.log('attendance saved', data);
                    if(attendanceId.result == 'Successful') {
                        $scope.loadingStatus = false;
                        setAttendance(configData.lms_teacher_attendance_listing, attendanceDate, sessionId, attendanceId.id)
                            .then(function(data) {
                                console.log('student list', data);
                                $scope.studentAttendanceList = data.attendance_list;
                            });
                    }
                    $scope.loadingStatus = false;
                });
        };

        $scope.editAttendance = function(studentAttendanceId, status) {
            $scope.loadingStatus = true;
            var sessionId = $scope.attendance.subjectName,
                attendanceDate = $scope.attendance.date;

            var attendanceDayId = self.lmsDataCache.get('take_attendance');
            status = status ? 'false' : 'true';

            setAttendance(configData.lms_edit_attendance, attendanceDate, sessionId, attendanceDayId.id, studentAttendanceId, status)
                .then(function(data) {
                    $scope.loadingStatus = false;
                    console.log('attendance updated', data);
                });
        }
    });

}());