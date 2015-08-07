(function() {

    var attendanceApp = angular.module('kcm-app.controllers');

    attendanceApp.controller('attendanceController', function($scope, $http, CacheFactory, $q) {
        /*
         * if given group is the selected group, deselect it
         * else, select the given group
         */
        $scope.toggleGroup = function(group) {
            if ($scope.isGroupShown(group)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = group;
            }
        };
        $scope.isGroupShown = function(group) {
            return $scope.shownGroup === group;
        };

        $scope.loadingStatus = true;
        $scope.teacher = false;
        $scope.student = false;
        $scope.baseUrl = configData.base_url;
        $scope.attendance = {subjectName: '', month: ''};
        self.lmsDataCache = CacheFactory.get("lmsDataCache");
        self.userDetailCache = CacheFactory.get("userdetailCache");

        var userDetails = self.userDetailCache.get('userdetail');
        if(userDetails) {
            if(userDetails.role == 'Teacher') {
                $scope.teacher = true;
            } else if(userDetails.role == 'Student') {
                $scope.student = true;
            }
        }

        if($scope.student) {
            /* Getting attendance data */
            var activeAttendanceCacheKey = "activeAttendance",
                activeAttendanceData = self.lmsDataCache.get(activeAttendanceCacheKey);
            getLmsData(activeAttendanceData, configData.lms_active_attendance, activeAttendanceCacheKey)
                .then(function(data) {
                    activeAttendanceData = data;
                });

            var inactiveAttendanceDataCacheKey = "inactiveAttendance",
                inactiveAttendanceData = self.lmsDataCache.get(inactiveAttendanceDataCacheKey);
            getLmsData(inactiveAttendanceData, configData.lms_inactive_attendance, inactiveAttendanceDataCacheKey)
                .then(function(data) {
                    inactiveAttendanceData = data;
                });
            /* Getting attendance data */

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
                $scope.presentAttendance = 0;
                $scope.absentAttendance = 0;

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

                    if(inactiveAttendanceData && inactiveAttendanceData.result != 'Not a user') {
                        $scope.loadingStatus = false;
                        var inactiveAttendances = inactiveAttendanceData.session_attendances;
                        var totalInactiveAttendance = getTotalAttendance(inactiveAttendances);
                        $scope.presentAttendance += totalInactiveAttendance.totalPresent;
                        $scope.absentAttendance += totalInactiveAttendance.totalAbsent;
                    } else {
                        getLmsData(inactiveAttendanceData, configData.lms_inactive_attendance, inactiveAttendanceDataCacheKey, true)
                            .then(function(data) {
                                var inactiveAttendances = data.session_attendances;
                                var totalInactiveAttendance = getTotalAttendance(inactiveAttendances);
                                $scope.presentAttendance += totalInactiveAttendance.totalPresent;
                                $scope.absentAttendance += totalInactiveAttendance.totalAbsent;
                            });
                    }

                    if(activeAttendanceData && activeAttendanceData.result != 'Not a user') {
                        $scope.loadingStatus = false;
                        var activeAttendances = activeAttendanceData.session_attendances;
                        var totalActiveAttendance = getTotalAttendance(activeAttendances);
                        $scope.presentAttendance += totalActiveAttendance.totalPresent;
                        $scope.absentAttendance += totalActiveAttendance.totalAbsent;
                    } else {
                        getLmsData(activeAttendanceData, configData.lms_active_attendance, activeAttendanceCacheKey, true)
                            .then(function(data) {
                                var activeAttendances = data.session_attendances;
                                var totalActiveAttendance = getTotalAttendance(activeAttendances);
                                $scope.presentAttendance += totalActiveAttendance.totalPresent;
                                $scope.absentAttendance += totalActiveAttendance.totalAbsent;
                            });
                    }
                } else { // offline
                    $scope.subjects = subjectsData.user_subjects.profile.sessions;
                    console.log('Offline from cache');
                }
            });
        } else if($scope.teacher) {
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
                    $scope.subjects = subjectsData.user_subjects.profile.sessions;
                    console.log('Offline from cache');
                }
            });
        }

        $scope.doRefresh = function () {
            console.log('refresh');
            $scope.fetchajaxData().then(function(){
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        /* Getting data form LMS API */
        function getLmsData (currentCacheData, functionName, dataCacheKey, forceRefresh, lmsUrl) {
            if(typeof lmsUrl == 'undefined') {
                lmsUrl = configData.lms_url;
            }
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
                $http.post(lmsUrl, params)
                    .success(function(data) {
                        $scope.loadingStatus = false;
                        self.lmsDataCache.put(dataCacheKey, data);
                        deferred.resolve(data);
                    })
                    .error(function(log) {
                        $scope.loadingStatus = false;
                        deferred.reject();
                        console.log('Error ' + log);
                    });
            }
            return deferred.promise;
        }
        function getTeacherAttendanceData (currentCacheData, dataCacheKey, forceRefresh) {
            var deferred = $q.defer();
            self.userpasswordCache = CacheFactory.get("userpasswordCache");
            var cacheKey = "userpassword";
            var userpassword = self.userpasswordCache.get(cacheKey);

            self.useremailCache = CacheFactory.get("useremailCache");
            var cacheKey = "useremail";
            var useremail = self.useremailCache.get(cacheKey);

            if(typeof (currentCacheData) === 'undefined' || typeof (forceRefresh) != 'undefined') {
                var params = {
                    api_key: configData.lms_api,
                    username: useremail,
                    password: userpassword,
                    information: configData.lms_teacher_attendance,
                    session_id: $scope.attendance.subjectName
                };
                $http.post(configData.lms_teacher_attendance_url, params)
                    .success(function(data) {
                        $scope.loadingStatus = false;
                        self.lmsDataCache.put(dataCacheKey, data);
                        deferred.resolve(data);
                    })
                    .error(function(log) {
                        $scope.loadingStatus = false;
                        deferred.reject();
                        console.log({errors: log});
                    });
            }
            return deferred.promise;
        }
        /* Getting data form LMS API */

        /* Get total attendance */
        function getTotalAttendance(attendanceData) {
            var pAttendance = 0;
            var aAttendance = 0;

            for(var i = 0; i < attendanceData.length; i++) {
                pAttendance += attendanceData[i].attendance.present;
                aAttendance += attendanceData[i].attendance.absent;
            }

            return {totalPresent: pAttendance, totalAbsent: aAttendance};
        }
        /* Get total attendance */

        /* Filter attendance by subject */
        $scope.filterAttendance = function() {
            var selectedSubject = $scope.attendance.subjectName;
            var selectedMonth = $scope.attendance.month;

            if($scope.student) {
                var allInactiveAttendanceData = self.lmsDataCache.get('inactiveAttendance');
                allInactiveAttendanceData = allInactiveAttendanceData.session_attendances;

                var allActiveAttendanceData = self.lmsDataCache.get('activeAttendance');
                allActiveAttendanceData = allActiveAttendanceData.session_attendances;

                var filterDataInactive = _.filter(allInactiveAttendanceData, {'subject_name': selectedSubject});
                var filterDataActive = _.filter(allActiveAttendanceData, {'subject_name': selectedSubject});

                $scope.presentAttendance = 0;
                $scope.absentAttendance = 0;

                var totalInactiveAttendance = getTotalAttendance(filterDataInactive);
                $scope.presentAttendance += totalInactiveAttendance.totalPresent;
                $scope.absentAttendance += totalInactiveAttendance.totalAbsent;

                var totalActiveAttendance = getTotalAttendance(filterDataActive);
                $scope.presentAttendance += totalActiveAttendance.totalPresent;
                $scope.absentAttendance += totalActiveAttendance.totalAbsent;
            } else if($scope.teacher) {
                $scope.loadingStatus = true;
                /* Getting teacher student attendance data */
                var teacherStudentAttendanceCacheKey = "teacherStudentAttendance",
                    teacherStudentAttendanceData = self.lmsDataCache.get(teacherStudentAttendanceCacheKey);
                getTeacherAttendanceData(teacherStudentAttendanceData, teacherStudentAttendanceCacheKey, true)
                    .then(function(data) {
                        $scope.loadingStatus = false;
                        teacherStudentAttendanceData = data;
                        $scope.teacherAttendance = teacherStudentAttendanceData.attendance_summary;
                    });
                /* Getting teacher student attendance data */
            }
        };
        /* Filter attendance by subject */

        $scope.subjectTypeChange = function(subjectType) {
            allSubjects = subjectsData.user_subjects.profile.sessions;
            $scope.subjects = _.filter(allSubjects, {session_status: subjectType});
        };
    });

}());