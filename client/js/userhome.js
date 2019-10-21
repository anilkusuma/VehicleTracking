var app = angular.module('Home', ['ngRoute','scDateTime','mgcrea.ngStrap','ngCookies','ngFileUpload','ng.deviceDetector','ngTouch']);
var selector = Cookies.get('selector');
var validator= Cookies.get('validator');
var userID = Cookies.get('userID');
var userType = Cookies.get('userType');
var companyId = Cookies.get('companyId');
if(selector == null || validator== null || userID == null || userType == null || companyId == null){
    window.location = '/login';
}else{
    if(userType == 'ADMIN'){
        app.config(['$routeProvider','$locationProvider','$provide','$sceDelegateProvider',function ($routeProvider,$locationProvider,$provide,$sceDelegateProvider) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                'https://drive.google.com/**',
                'https://www.youtube.com/**',
                'http://apis.mapmyindia.com/**'
            ]);
            $routeProvider
            .when('/live', {
                templateUrl: '/modules/Dashboard/dashboard.html',
                controller: 'dashboardCtr'
            })
            .when('/history', {
                templateUrl: '/modules/History/history.html',
                controller: 'historyCtr'
            })
            .when('/replay', {
                templateUrl: '/modules/Replay/replay.html',
                controller: 'replayCtr'
            })
            .when('/vehicles', {
                templateUrl: '/modules/Create/vehicles.html',
                controller: 'vehicleCtr'
            })
            .when('/points', {
                templateUrl: '/modules/Create/pois.html',
                controller: 'poiCtr'
            })
            .when('/users', {
                templateUrl: '/modules/Create/users.html',
                controller: 'userCtr'
            })
            .when('/drivers', {
                templateUrl: '/modules/Create/drivers.html',
                controller: 'driverCtr'
            })
            .when('/fences', {
                templateUrl: '/modules/Create/geofence.html',
                controller: 'fenceCtr'
            })
            .when('/admins', {
                templateUrl: '/modules/Create/customers.html',
                controller: 'customerCtr'
            })
            .when('/reports/general', {
                templateUrl: '/modules/Reports/generalDayReports.html',
                controller: 'generalCtr'
            })
            .when('/reports/detail', {
                templateUrl: '/modules/Reports/detailDayReports.html',
                controller: 'detailCtr'
            })
            .when('/reports/overspeed', {
                templateUrl: '/modules/Reports/overSpeedReports.html',
                controller: 'overSpeedCtr'
            })
            .when('/reports/stoppage', {
                templateUrl: '/modules/Reports/stoppageReports.html',
                controller: 'stoppageCtr'
            })
            .when('/settings', {
                templateUrl: '/modules/Settings/settings.html',
                controller: 'settingsCtr'
            })
            .when('/profile', {
                templateUrl: '/modules/Profile/profile.html',
                controller: 'profileCtr'
            })
            .otherwise({
                redirectTo :  '/live'
            });
            $locationProvider.html5Mode(true);
        }]);
    }else if(userType == 'COMPANY'){
        app.config(['$routeProvider','$locationProvider','$provide','$sceDelegateProvider',function ($routeProvider,$locationProvider,$provide,$sceDelegateProvider) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                'https://drive.google.com/**',
                'https://www.youtube.com/**',
                'http://apis.mapmyindia.com/**'
            ]);
            $routeProvider
            .when('/live', {
                templateUrl: '/modules/Dashboard/dashboard.html',
                controller: 'dashboardCtr'
            })
            .when('/history', {
                templateUrl: '/modules/History/history.html',
                controller: 'historyCtr'
            })
            .when('/replay', {
                templateUrl: '/modules/Replay/replay.html',
                controller: 'replayCtr'
            })
            .when('/vehicles', {
                templateUrl: '/modules/Create/vehicles.html',
                controller: 'vehicleCtr'
            })
            .when('/points', {
                templateUrl: '/modules/Create/pois.html',
                controller: 'poiCtr'
            })
            .when('/users', {
                templateUrl: '/modules/Create/users.html',
                controller: 'userCtr'
            })
            .when('/drivers', {
                templateUrl: '/modules/Create/drivers.html',
                controller: 'driverCtr'
            })
            .when('/fences', {
                templateUrl: '/modules/Create/geofence.html',
                controller: 'fenceCtr'
            })
            .when('/customers', {
                templateUrl: '/modules/Create/customers.html',
                controller: 'customerCtr'
            })
            .when('/reports/general', {
                templateUrl: '/modules/Reports/generalDayReports.html',
                controller: 'generalCtr'
            })
            .when('/reports/detail', {
                templateUrl: '/modules/Reports/detailDayReports.html',
                controller: 'detailCtr'
            })
            .when('/reports/overspeed', {
                templateUrl: '/modules/Reports/overSpeedReports.html',
                controller: 'overSpeedCtr'
            })
            .when('/reports/stoppage', {
                templateUrl: '/modules/Reports/stoppageReports.html',
                controller: 'stoppageCtr'
            })
            .when('/reports/geofence', {
                templateUrl: '/modules/Reports/geoFenceReports.html',
                controller: 'geoReportsCtr'
            })
            .when('/reports/distance', {
                templateUrl: '/modules/Reports/distanceReports.html',
                controller: 'distanceReportsCtr'
            })
            .when('/settings', {
                templateUrl: '/modules/Settings/settings.html',
                controller: 'settingsCtr'
            })
            .when('/profile', {
                templateUrl: '/modules/Profile/profile.html',
                controller: 'profileCtr'
            })
            .otherwise({
                redirectTo :  '/live'
            });
            $locationProvider.html5Mode(true);
        }]);
    }else if(userType == 'USER'){
        app.config(['$routeProvider','$locationProvider','$provide','$sceDelegateProvider',function ($routeProvider,$locationProvider,$provide,$sceDelegateProvider) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                'https://drive.google.com/**',
                'https://www.youtube.com/**',
                'http://apis.mapmyindia.com/**'
            ]);
            $routeProvider
            .when('/live', {
                templateUrl: '/modules/Dashboard/dashboard.html',
                controller: 'dashboardCtr'
            })
            // .when('/history', {
            //     templateUrl: '/modules/History/history.html',
            //     controller: 'historyCtr'
            // })
            // .when('/replay', {
            //     templateUrl: '/modules/Replay/replay.html',
            //     controller: 'replayCtr'
            // })
            // .when('/vehicles', {
            //     templateUrl: '/modules/Create/vehicles.html',
            //     controller: 'vehicleCtr'
            // })
            // .when('/points', {
            //     templateUrl: '/modules/Create/pois.html',
            //     controller: 'poiCtr'
            // })
            // .when('/users', {
            //     templateUrl: '/modules/Create/users.html',
            //     controller: 'userCtr'
            // })
            // .when('/drivers', {
            //     templateUrl: '/modules/Create/drivers.html',
            //     controller: 'driverCtr'
            // })
            // .when('/fences', {
            //     templateUrl: '/modules/Create/geofence.html',
            //     controller: 'fenceCtr'
            // })
            // .when('/reports/general', {
            //     templateUrl: '/modules/Reports/generalDayReports.html',
            //     controller: 'generalCtr'
            // })
            // .when('/reports/detail', {
            //     templateUrl: '/modules/Reports/detailDayReports.html',
            //     controller: 'detailCtr'
            // })
            // .when('/reports/overspeed', {
            //     templateUrl: '/modules/Reports/overSpeedReports.html',
            //     controller: 'overSpeedCtr'
            // })
            // .when('/reports/stoppage', {
            //     templateUrl: '/modules/Reports/stoppageReports.html',
            //     controller: 'stoppageCtr'
            // })
            // .when('/reports/geofence', {
            //     templateUrl: '/modules/Reports/geoFenceReports.html',
            //     controller: 'geoReportsCtr'
            // })
            // .when('/reports/distance', {
            //     templateUrl: '/modules/Reports/distanceReports.html',
            //     controller: 'distanceReportsCtr'
            // })
            .when('/profile', {
                templateUrl: '/modules/Profile/profile.html',
                controller: 'profileCtr'
            })
            .otherwise({
                redirectTo :  '/live'
            });
            $locationProvider.html5Mode(true);
        }]);
    }
}
app.factory('RootSer',['$http','$rootScope',function($http,$rootScope){
    var RootSers = {};
    return RootSers;
}]);

app.controller('HomeMain',['$scope','$rootScope','$http','$location','$window','$cookies','$timeout','RootSer','deviceDetector',function($scope,$rootScope,$http,$window,$location,$cookies,$timeout,RootSer,deviceDetector){
    if(deviceDetector.isDesktop()){
        $rootScope.desktop=true;
    }else{
        $rootScope.desktop=false;
    }

    $rootScope.showPreloaderInPreloaderToast = false;
    $rootScope.showPreloaderToast = false;
    $rootScope.preloaderToastText = '';
    $rootScope.baseUrl = '';
    $rootScope.AndroidText = '';
    $rootScope.userDetails = {};
    $rootScope.userDetailsDone = false;
    $rootScope.ReplayTimeOutVariable = '';
    $rootScope.dashboardTimers = [];

    $rootScope.$on('$routeChangeStart', function(event, current) {
        $('.lean-overlay').remove();
        if($rootScope.ReplayTimeOutVariable != ''){
            $timeout.cancel($rootScope.ReplayTimeOutVariable);
        }
        for(var i=0;i<$rootScope.dashboardTimers.length;i++){
            if($rootScope.dashboardTimers[i].timerPromise != '' && $rootScope.dashboardTimers[i].timerPromise != undefined){
                $timeout.cancel($rootScope.dashboardTimers[i].timerPromise);
            }
        }
    });

    $rootScope.displayPreloaderToast = function(toastText,showPreloader,timer){
        $rootScope.showPreloaderToast = false;

        if(showPreloader){
            $rootScope.showPreloaderInPreloaderToast = true;
        }else{
            $rootScope.showPreloaderInPreloaderToast = false;
        }

        $rootScope.preloaderToastText = toastText;
        $rootScope.showPreloaderToast = true;
        if(timer != undefined || timer != null){
            $timeout($rootScope.hidePreloaderToast,timer,true);
        }
    };
    $rootScope.hidePreloaderToast = function(){
        $rootScope.preloaderToastText = '';
        $rootScope.showPreloaderInPreloaderToast = true;
        $rootScope.showPreloaderToast = false;
    };

    var showPage = function(){
        var name = $rootScope.userDetails.name;
        $scope.username = name.toTitleCase();
        if($rootScope.userDetails.userType == 'ADMIN'){
            $scope.userRoal = 'Admin';
        }else if ($rootScope.userDetails.userType == 'COMPANY'){
            $scope.userRoal = 'Agency';
        }else{
            $scope.userRoal = 'User';
        }
        $rootScope.refreshImage();
        if(deviceDetector.isDesktop()){
            $(".button-collapse").sideNav();
        }else{
            $(".button-collapse").sideNav({
                closeOnClick: true
            });
        }

        $('.main-preloaderDiv').hide();
        $(document.body).css('justify-content','inherit');
        $(document.body).css('align-items','inherit');
        var numDivs = $('#header,#main,#footer').length;
        $('#header,#main,#footer').fadeIn(200,function(){
            if(--numDivs > 0) return;
            $rootScope.userDetailsDone = true;
            $timeout(function(){
                $('.collapsible').collapsible({
                    accordion : true
                });
                $rootScope.$broadcast('DetailsDone');
            },0,true);
        });
    };

    $rootScope.adminType = false;
    $rootScope.companyType = false;
    $rootScope.userType=false;


    $rootScope.getUserDetails = function(){
        var selector = $cookies.get('selector');
        var validator = $cookies.get('validator');
        var userID = $cookies.get('userID');
        var userType = $cookies.get('userType');
        var companyId = $cookies.get('companyId');

        if(selector == null || validator == null || userID == null || userType == null || companyId == null){
            $cookies.remove('selector');
            $cookies.remove('validator');
            $cookies.remove('userID');
            $cookies.remove('userType');
            $cookies.remove('companyId');
            window.location = '/login';
        }else{
            var url=$rootScope.baseUrl+ '/api/VtsUsers/bUserDetails';
            $http({
                method: 'GET',
                url: url
            }).then(function successCallback(response) {
                var data = response.data;
                if(data.returnStatus == "SUCCESS"){
                    $rootScope.userDetails.userId = userID;
                    if(data.userType == "COMPANY"){
                        $rootScope.companyType = true;
                        $rootScope.userDetails.userType = "COMPANY";
                        $rootScope.userDetails.userId = data.responseData[0].userId;
                        $rootScope.userDetails.name = data.responseData[0].name;
                        $rootScope.userDetails.address = data.responseData[0].address;
                        $rootScope.userDetails.mobileNumber = data.responseData[0].mobileNumber;
                        $rootScope.userDetails.emailId = data.responseData[0].emailId;
                        $rootScope.userDetails.companyId = data.responseData[0].vtsLogin.companyId;
                        showPage();
                    }else if(data.userType == "USER"){
                        $rootScope.userType = true;
                        $rootScope.userDetails.userType = "USER";
                        $rootScope.userDetails.userId = data.responseData[0].userId;
                        $rootScope.userDetails.name = data.responseData[0].name;
                        $rootScope.userDetails.address = data.responseData[0].address;
                        $rootScope.userDetails.mobileNumber = data.responseData[0].mobileNumber;
                        $rootScope.userDetails.emailId = data.responseData[0].emailId;
                        $rootScope.userDetails.companyId = data.responseData[0].vtsLogin.companyId;
                        showPage();
                    }else if(data.userType == "ADMIN"){
                        $rootScope.adminType = true;
                        $rootScope.userDetails.userType = "ADMIN";
                        $rootScope.userDetails.userId = data.responseData[0].userId;
                        $rootScope.userDetails.name = data.responseData[0].name;
                        $rootScope.userDetails.address = data.responseData[0].address;
                        $rootScope.userDetails.mobileNumber = data.responseData[0].mobileNumber;
                        $rootScope.userDetails.emailId = data.responseData[0].emailId;
                        $rootScope.userDetails.companyId = data.responseData[0].vtsLogin.companyId;
                        showPage();
                    }
                }
                else{
                    Materialize.toast('Unexpected Error.Please Login Again',2000,'rounded',function(){
                        $cookies.remove('selector');
                        $cookies.remove('validator');
                        $cookies.remove('userID');
                        $cookies.remove('userType');
                        $cookies.remove('companyId');
                        window.location = '/login';
                    });
                }
            },function errorCallback(response) {
                Materialize.toast('Unexpected Error.Please Login Again',2000,'rounded',function(){
                    $cookies.remove('selector');
                    $cookies.remove('validator');
                    $cookies.remove('userID');
                    $cookies.remove('userType');
                    $cookies.remove('companyId');
                    window.location = '/login';
                });
            });
        }
    };

    var init = function(){
        $rootScope.getUserDetails();
    };

    init();
    $rootScope.refreshImage = function(){
        if($rootScope.userDetails.userType == "PARENT"){
            return;
        }else{
            $(".profile-image")
            .on('load', function() {})
            .on('error', function() { $(".profile-image").attr("src", './userimages/dudp.jpg?r='+Math.random());})
            .attr("src", './userimages/'+$rootScope.userDetails.userId+'.jpg?r='+Math.random());
        }
    }
    $rootScope.logout = function(){
        $cookies.remove('selector');
        $cookies.remove('validator');
        $cookies.remove('userID');
        $cookies.remove('userType');
        $cookies.remove('companyId');
        window.location = '/login';
    }
    $rootScope.initSelect = function(){
        $timeout(function(){
            $('select').material_select();
        },0,false);
    };
    $rootScope.getUsersOfCompany = function(callback){
        var url = '/api/VtsUsers/GetCompanyUsers';
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };

    $rootScope.getAllCompanies = function(callback){
        var url = '/api/VtsUsers/GetAllCompanies';
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };

    $rootScope.geoDecode = function(myLatLng,callback){
        var geocoder = new google.maps.Geocoder();
        var result = '';
        geocoder.geocode({'location': myLatLng}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    result = results[0].formatted_address;
                }else {
                    result = myLatLng.lat().toFixed(5)+','+myLatLng.lng().toFixed(5);
                }
            }
            else {
                result = myLatLng.lat().toFixed(5)+','+myLatLng.lng().toFixed(5);
            }
            callback(result);
        });
    };
}]);
