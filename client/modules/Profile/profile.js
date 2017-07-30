

app.factory('ProfileSer',['$http','$rootScope',function($http,$rootScope){
    var ProfileSers = {};
    
    
    return ProfileSers;
}]);


app.controller('profileCtr',['$rootScope','$scope','ProfileSer','$timeout','$http','Upload',function($rootScope,$scope,ProfileSer,$timeout,$http,Upload){
    $rootScope.AndroidText = 'Profile'
    showPreloader();
    $timeout(function(){
        $('ul.tabs').tabs()
    },0,false);
    hidePreloader();
    
    $scope.initialize = function(){
        if($scope.DetailDoneEvent)
                $scope.DetailDoneEvent();
        $scope.user = $rootScope.userDetails;
        $scope.user.newPassword ='';
        $scope.user.oldPassword = '';
        $scope.user.reTypeNewPassword = '';
        $scope.refreshImage();
    };
    $scope.refreshImage = function(){
        $(".profile-pic-image").on('load', function(){

        }).on('error',function(){
            $(".profile-pic-image").attr("src", './userimages/dudp.jpg?r='+Math.random());
        }).attr("src", './userimages/'+$rootScope.userDetails.userId+'.jpg?r='+Math.random());
    }
    
    $scope.uploadProfilePic = function(){
        if($scope.profilePic){
            Upload.upload({
                url:'api/VtsUsers/UpdateProfilePic',
                data : {file:$scope.profilePic}
            }).then(function (resp) {
                $scope.refreshImage();
                $rootScope.refreshImage();
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            });
        }
    }; 
    
    $scope.updatePassowrd = function(){
        if($scope.user.newPassword == '' || $scope.user.reTypeNewPassword == '' || $scope.user.oldPassword == ''){
            Materialize.toast('Please enter all details ',2000);
        }else if($scope.user.newPassword != $scope.user.reTypeNewPassword){
            Materialize.toast('Retype password should be same',2000);
        }else{
            var oldPassword = $scope.user.oldPassword;
            var newPassword = $scope.user.newPassword;
            var url=$rootScope.baseUrl+ '/api/VtsLogins/UpdatePassword?newPassword='+newPassword+'&oldPassword='+oldPassword;
            $http({
                method: 'GET',
                url: url
            }).then(function successCallback(response) {
                if(response.data.returnStatus == 'SUCCESS'){
                    Materialize.toast('Password updated successfully,please login again',3000);
                    $rootScope.logout();
                }else if(response.data.returnStatus == 'EMPTY'){
                    Materialize.toast('Invalid current password',3000);
                }else{
                    Materialize.toast('Error in updating please try again',3000);
                }
            },function errorCallback(response) {
                Materialize.toast('Error in updating please try again',3000);
            });
        }
    };
    
    if($rootScope.userDetailsDone){
        $scope.initialize();
    }else{
        $scope.DetailDoneEvent =    $scope.$on('DetailsDone',function(event,data){
                                        $scope.initialize();
                                    });
    }; 
    
}]);         