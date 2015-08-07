(function() {

    var subjectApp = angular.module('kcm-app.controllers');

    subjectApp.controller('subjectController', function($scope, $http, CacheFactory, $q) {
        $scope.loadingStatus = true;
        $scope.baseUrl = configData.base_url;
        $scope.teacher = false;
        $scope.student = false;
        $scope.mySubject = {subjectName: '', sessionName: ''};
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
            /* Getting subjects data */
            var subjectsCacheKey = "subjects",
                subjectsData = self.lmsDataCache.get(subjectsCacheKey);
            getLmsData(subjectsData, configData.lms_subject, subjectsCacheKey)
                .then(function(data) {
                    subjectsData = data;
                });
            /* Getting subjects data */

            /* Getting results data */
            var activeResultsCacheKey = "activeResults",
                activeResultsData = self.lmsDataCache.get(activeResultsCacheKey);
            getLmsData(activeResultsData, configData.lms_active_results, activeResultsCacheKey)
                .then(function(data) {
                    activeResultsData = data.active_session_assessment;
                });

            var inActiveResultsCacheKey = "inActiveResults",
                inActiveResultsData = self.lmsDataCache.get(inActiveResultsCacheKey);
            getLmsData(inActiveResultsData, configData.lms_inactive_results, inActiveResultsCacheKey)
                .then(function(data) {
                    inActiveResultsData = data.inactive_session_assessment;
                });
            /* Getting results data */

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
                                $scope.subjects = data.user_subjects.profile.sessions;
                            });
                    }

                    if(activeResultsData && activeResultsData.result == 'Successful') {
                        $scope.loadingStatus = false;
                        $scope.activeResults = activeResultsData.active_session_assessment;
                    } else {
                        getLmsData(activeResultsData, configData.lms_active_results, activeResultsCacheKey, true)
                            .then(function(data) {
                                $scope.activeResults = data.active_session_assessment;
                                $scope.showResults = data.active_session_assessment;
                            });
                    }

                    if(inActiveResultsData && inActiveResultsData.result == 'Successful') {
                        $scope.loadingStatus = false;
                        $scope.inActiveResults = inActiveResultsData.inactive_session_assessment;
                    } else {
                        getLmsData(inActiveResultsData, configData.lms_inactive_results, inActiveResultsCacheKey, true)
                            .then(function(data) {
                                $scope.inActiveResults = data.inactive_session_assessment;
                            });
                    }
                } else { // offline
                    $scope.subjects = _.filter(subjectsData.user_subjects.profile.sessions, {session_status: 'Active'});
                    $scope.activeResults = activeResultsData.active_session_assessment;
                    $scope.inActiveResults = inActiveResultsData.inactive_session_assessment;

                    $scope.showResults = activeResultsData.active_session_assessment;
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
                    $scope.subjects = _.filter(subjectsData.user_subjects.profile.sessions, {session_status: 'Active'});
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
        function getLmsData (currentCacheData, functionName, dataCacheKey, forceRefresh, apiUrl, sessionId) {
            if(typeof apiUrl == 'undefined') {
                apiUrl = configData.lms_url;
            }
            var deferred = $q.defer();
            self.userpasswordCache = CacheFactory.get("userpasswordCache");
            var cacheKey = "userpassword";
            var userpassword = self.userpasswordCache.get(cacheKey);

            self.useremailCache = CacheFactory.get("useremailCache");
            var cacheKey = "useremail";
            var useremail = self.useremailCache.get(cacheKey);

            if(typeof (currentCacheData) === 'undefined' || (typeof (forceRefresh) != 'undefined') && forceRefresh) {
                var params = {
                    "api_key": configData.lms_api,
                    "username" : useremail,
                    "password" : userpassword,
                    "information" : functionName
                };
                if(typeof sessionId != 'undefined') {
                    params.session_id = sessionId;
                }
                $http.post(apiUrl, params)
                    .success(function(data) {
                        $scope.loadingStatus = false;
                        console.log(dataCacheKey, data);
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
        /* Getting data form LMS API */

        /* Get Results */
        $scope.filterResults = function() {
            var selectedSubject = $scope.mySubject.subjectName;
            if($scope.student) {
                var allInactiveResultsData = self.lmsDataCache.get(inActiveResultsCacheKey);
                allInactiveResultsData = allInactiveResultsData.inactive_session_assessment;

                var allActiveResultsData = self.lmsDataCache.get(activeResultsCacheKey);
                allActiveResultsData = allActiveResultsData.active_session_assessment;

                var filterDataInactive = _.filter(allInactiveResultsData, {'subject_name': selectedSubject});
                var filterDataActive = _.filter(allActiveResultsData, {'subject_name': selectedSubject});

                if(_.isEmpty(filterDataActive)) {
                    $scope.showResults = filterDataInactive;
                }
                if(_.isEmpty(filterDataInactive)) {
                    $scope.showResults = filterDataActive;
                }
            } else if($scope.teacher) {
                var selectedAssessement = $scope.mySubject.sessionName;
                var allResultsData = self.lmsDataCache.get('teacherMarks');
                console.log('marks data for teacher', allResultsData);
                $scope.showResults = _.filter(allResultsData.assessments, {'name': selectedAssessement});
                console.log('filtered data for teacher', $scope.showResults);
            }
        };
        /* Get Results */

        $scope.selectAssessment = function() {
            $scope.loadingStatus = true;
            var selectedSubject = $scope.mySubject.subjectName;

            /* Getting results for teacher */
            var teacherMarksCacheKey = "teacherMarks",
                teacherMarksData = self.lmsDataCache.get(teacherMarksCacheKey);
            getLmsData(teacherMarksData, configData.lms_teacher_marks, teacherMarksCacheKey, true, configData.lms_teacher_attendance_url, selectedSubject)
                .then(function(data) {
                    $scope.loadingStatus = false;
                    console.log('marks for teacher', data);
                    $scope.filteredAssessments = data;
                });
            /* Getting results for teacher */
        }

        $scope.subjectTypeChange = function(subjectType) {
            allSubjects = subjectsData.user_subjects.profile.sessions;
            $scope.subjects = _.filter(allSubjects, {session_status: subjectType});
        };
    });
}());