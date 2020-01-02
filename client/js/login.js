var module = angular.module('VtsLogin',['ngCookies']);
module.controller('loginForm',['$scope','$http','$window','$cookies','$timeout',function($scope,$http,$window,$cookies,$timeout){
    $scope.baseUrl = 'http://127.0.0.1:7102';
    $scope.userName='';
    $scope.password='';
    $scope.rememberMe = true;
    $scope.login = function(){
        if(!$scope.userName.replace(/\s/g, '').length){
            var html = 'Please enter username';
            $('#username-error,#userName ').addClass('error');
            $('#username-error').text(html);
            $('.errorNameUsername').show();
        }else if(!$scope.password.replace(/\s/g, '').length){
            var html = 'Please enter password';
            $('#password-error,#password').addClass('error');
            $('#password-error').text(html);
            $('.errorNamePassword').show();
        }else{
            var rememberMe,expireDate;
            if ($scope.rememberMe)
            {
                rememberMe = 'Y';
            }
            else {
                rememberMe = 'N';
            }

            var url=$scope.baseUrl+ '/api/Logins/Login?userName='+$scope.userName+'&password='+$scope.password+"&rememberMe="+rememberMe;
            $http({
              method: 'GET',
              url: url
            }).then(function successCallback(response) {
                console.log(response.data);
                var data = response.data;
                if(data.responseStatus) {
                    if (rememberMe == 'Y') {
                        expireDate = new Date('2020');
                    } else {
                        expireDate = null;
                    }
                    $cookies.remove("selector");
                    $cookies.remove("validator");
                    $cookies.remove("userId");
                    $cookies.remove("userType");
                    $cookies.remove("accountId");

                    $cookies.put('selector', data.responseData.selector, {expires: expireDate, path: '/'});
                    $cookies.put('validator', data.responseData.validator, {expires: expireDate, path: '/'});
                    $cookies.put('userId', data.responseData.userId, {expires: expireDate, path: '/'});
                    $cookies.put('userType', data.responseData.userType, {expires: expireDate, path: '/'});
                    $cookies.put('accountId', data.responseData.accountId, {expires: expireDate, path: '/'});
                    $window.location = '/home';
                } else {
                   $scope.password = '';
                   $('#userName').removeClass('dirty');
                   $('#password').removeClass('dirty');
                   var html = 'Invalid Username and Password';
                   $('#username-error,#password-error,#userName,#password').addClass('error');
                   $('#username-error,#password-error').text(html);
                   $('.errorName').show();
                }
            },function errorCallback(response) {
                $scope.password = '';
                $('#userName').removeClass('dirty');
                $('#password').removeClass('dirty');
                var html = 'Invalid Username and Password';
                $('#username-error,#password-error,#userName,#password').addClass('error');
                $('#username-error,#password-error').text(html);
                $('.errorName').show();
            });
        }
    };
    $scope.inputFocused = function(type){
        $('.errorName').hide();
    };
    $scope.inputChanged = function($event){
        var keyCode = $event.keyCode;
        if (keyCode == '13') {
            $scope.login();
        }
    };
}]);
