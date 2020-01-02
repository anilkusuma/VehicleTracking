
app.controller('customerCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    $rootScope.AndroidText = 'Customers';
    showPreloader();
    $('select').material_select();
    $('.tooltipped').tooltip({delay: 50});

    $scope.addCustomer = function(){
        $scope.$broadcast('createCustomer');
    }
    $scope.clickCustomer = function(customer){
        $rootScope.editCustomerClicked = customer;
        $scope.$broadcast('editCustomer');
    };
    $scope.deActivate = function(userId) {
        CreateService.deActivateCustomer(userId,function(status){
            if(status == "SUCCESS"){
                Materialize.toast('Customer access revoked.',1000);
                refreshCustomers();
            }else{
                Materialize.toast('Error in revoking access to customer',1000);
                refreshCustomers();
            }
        });
    };
    $scope.activate = function(userId) {
        CreateService.activateCustomer(userId,function(status){
            if(status == "SUCCESS"){
                Materialize.toast('Customer access restored.',1000);
                refreshCustomers();
            }else{
                Materialize.toast('Error in restoring access to customer',1000);
                refreshCustomers();
            }
        });
    };
    var refreshCustomers = function() {
        if($rootScope.userDetails.userType == 'ADMIN') {
            CreateService.getAllChildAccounts(function(status,customers) {
                if(status == "SUCCESS"){
                    $scope.customers = customers;
                    Materialize.toast('Success',1000);
                    hidePreloader();
                }else if(status=="EMPTY"){
                    hidePreloader();
                    Materialize.toast('No customers, add one',1000);
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
            });
        } else if($rootScope.userDetails.userType == 'COMPANY') {
            CreateService.getUsersOfAccount($rootScope.userDetails.accountId, function(status,customers) {
                if(status == "SUCCESS") {
                    $scope.customers = customers;
                    Materialize.toast('Success',1000);
                    hidePreloader();
                }else if(status=="EMPTY"){
                    hidePreloader();
                    Materialize.toast('No customers, add one',1000);
                }
                else if(status == "FAILED") {
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
            });
        }
    }
    var initialize = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#create').trigger("click.collapse");
            $('.customers-li').addClass('active');
        },0,false);
        refreshCustomers();
    };
    $scope.$on('refreshCustomers',refreshCustomers);

    if($rootScope.userDetailsDone){
        initialize();
    }else{
        $scope.DetailDoneEvent = $scope.$on('DetailsDone',function(event,data){
                                    initialize();
                                });
    };
}]);

app.controller('createCustomerCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    var init = function(){
        $scope.newCustomer = {};
        $scope.newCustomer.username = '';
        $scope.newCustomer.userInformation = '';
        $scope.newCustomer.name = '';
        $scope.newCustomer.emailId = '';
        $scope.newCustomer.mobileNumber = '';
        $scope.newCustomer.address = '';
        $scope.newCustomer.userNameTimer = '';
        $('#createCustomerModel').openModal({dismissible: false},1);
    };

    $scope.usernameChanged = function(){
        if($scope.newCustomer.username.replace(/\s/g, '').length){
            $timeout.cancel($scope.userNameTimer);
            $scope.userNameTimer = $timeout(checkUsername(function(status){
                if(!status){
                    var html = 'Username is not available';
                    $('#CreateUserName,#CreateUserName-error').removeClass('success');
                    $('#CreateUserName-error,#CreateUserName').addClass('error');
                    $('#CreateUserName-error').text(html);
                    $('.errorNameCreateUserName').show();
                    validated = false;
                }else{
                    var html = 'Username available';
                    $('#CreateUserName,#CreateUserName-error').removeClass('error');
                    $('#CreateUserName-error,#CreateUserName').addClass('success');
                    $('#CreateUserName-error').text(html);
                    $('.errorNameCreateUserName').show();
                }
            }),200,true);
        }
    };
    $scope.inputFocused = function(type){
        $('input').removeClass('error');
        $('.errorName').hide();
    };

    var validateEmail = function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    $scope.closeModel = function(){
        $('#createCustomerModel').closeModal();
    }
    $scope.saveCustomer = function(){
        var validated = true;
        if(!$scope.newCustomer.username.replace(/\s/g, '').length){
            var html = 'Please enter username.';
            $('#CreateUserName,#CreateUserName-error').removeClass('success');
            $('#CreateUserName-error,#CreateUserName').addClass('error');
            $('#CreateUserName-error').text(html);
            $('.errorNameCreateUserName').show();
            validated = false;
        }else {
            checkUsername(function(status){
                if(!status){
                    var html = 'Username is not available';
                    $('#CreateUserName,#CreateUserName-error').removeClass('success');
                    $('#CreateUserName-error,#CreateUserName').addClass('error');
                    $('#CreateUserName-error').text(html);
                    $('.errorNameCreateUserName').show();
                    validated = false;
                }else{
                    var html = 'Username available';
                    $('#CreateUserName,#CreateUserName-error').removeClass('error');
                    $('#CreateUserName-error,#CreateUserName').addClass('success');
                    $('#CreateUserName-error').text(html);
                    $('.errorNameCreateUserName').show();
                }
            });
        }
        if(!$scope.newCustomer.userInformation.replace(/\s/g, '').length){
            var html = 'Please enter password';
            $('#CreateUserPassword-error,#CreateUserPassword ').addClass('error');
            $("#CreateUserPassword-error").text(html);
            $('.errorNameCreateUserPassword').show();
            validated = false;
        }
        if(!$scope.newCustomer.name.replace(/\s/g, '').length){
            var html = 'Please enter name';
            $('#CreateCustomerName-error,#CreateCustomerName ').addClass('error');
            $('#CreateCustomerName-error').text(html);
            $('.errorNameCreateCustomerName').show();
            validated = false;
        }
        if(!$scope.newCustomer.emailId.replace(/\s/g, '').length){
            var html = 'Please enter email id';
            $('#CreateEmailId-error,#CreateEmailId ').addClass('error');
            $('#CreateEmailId-error').text(html);
            $('.errorNameCreateEmailId').show();
            validated = false;
        }else if(!validateEmail($scope.newCustomer.emailId)){
            var html = 'Enter a valid email id';
            $('#CreateEmailId-error,#CreateEmailId').addClass('error');
            $('#CreateEmailId-error').text(html);
            $('.errorNameCreateEmailId').show();
            valid = false;
        }
        if(!$scope.newCustomer.mobileNumber.replace(/\s/g, '').length){
            var html = 'Please enter phone number';
            $('#CreateMobileNumber-error,#CreateMobileNumber ').addClass('error');
            $('#CreateMobileNumber-error').text(html);
            $('.errorNameCreateMobileNumber').show();
            validated = false;
        }else{
            $scope.newCustomer.mobileNumber = $scope.newCustomer.mobileNumber.replace(/[^0-9]/g, '');
            if($scope.newCustomer.mobileNumber.length != 10) {
                var html = 'Enter valid phone number';
                $('#CreateMobileNumber-error,#CreateMobileNumber ').addClass('error');
                $('#CreateMobileNumber-error').text(html);
                $('.errorNameCreateMobileNumber').show();
                validated = false;
            }
        }

        if(validated){
            $scope.closeModel();
            CreateService.saveCustomer($scope.newCustomer,function(status){
                if(status == "SUCCESS"){
                    Materialize.toast('Customer created successfully',1000);
                    $scope.$emit('refreshCustomers');
                }else if(status == "ERROR"){
                    Materialize.toast('Error in creating customer,try again',1000);
                    $scope.$emit('refreshCustomers');
                }else if(status == "FAILED"){
                    Materialize.toast('Session expired.',1000);
                    $scope.$emit('refreshCustomers');
                }
            });
        }
    };

    var checkUsername = function(cb){
        var username = $scope.newCustomer.username;
        var url='/api/VtsLogins/checkUserName?userName='+username;
        $http({
          method: 'GET',
          url: url
        }).then(function successCallback(response) {
            var status = response.data.returnStatus;
            if(status == 'SUCCESS'){
                cb(true);
            }else{
                cb(false);
            }
        },function errorCallback(response){
            cb(false);
        });
    };
    $scope.$on('createCustomer',init);
}]);

app.controller('editCustomerCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    var init = function(){
        $scope.openedCustomer = {};
        $scope.openedCustomer.editClicked=false;
        $scope.openedCustomer.userId = $rootScope.editCustomerClicked.userId;
        $scope.openedCustomer.username = $rootScope.editCustomerClicked.userName;
        $scope.openedCustomer.userInformation = $rootScope.editCustomerClicked.userInformation;
        $scope.openedCustomer.name = $rootScope.editCustomerClicked.vtsUsers.name;
        $scope.openedCustomer.emailId = $rootScope.editCustomerClicked.vtsUsers.emailId;
        $scope.openedCustomer.mobileNumber = $rootScope.editCustomerClicked.vtsUsers.mobileNumber;
        $scope.openedCustomer.address = $rootScope.editCustomerClicked.vtsUsers.address;
        $timeout(function(){
            $('#editCustomerModel .input-field label').addClass('active');
            $('#editCustomerModel input,#editCustomerModel select,#editCustomerModel textarea').removeClass('error');
            $('#editCustomerModel input,#editCustomerModel select,#editCustomerModel textarea').removeClass('success');
            $('#editCustomerModel input,#editCustomerModel select,#editCustomerModel textarea').attr('disabled','disabled');
            $('select').material_select();
        },0,false);
        $('#editCustomerModel').openModal({dismissible: false},1);
    };

    $scope.inputFocused = function(type){
        $('input').removeClass('error');
        $('input').removeClass('success');
        $('.errorName').hide();
    };
    $scope.closeModel = function(){
        $('#editCustomerModel').closeModal();
    }
    var validateEmail = function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    $scope.closeModel = function(){
        $('#editCustomerModel').closeModal();
    }
    $scope.updateCustomer = function(){
        var validated = true;
        if(!$scope.openedCustomer.userInformation.replace(/\s/g, '').length){
            var html = 'Please enter password';
            $('#UserPassword-error,#UserPassword ').addClass('error');
            $("#UserPassword-error").text(html);
            $('.errorNameUserPassword').show();
            validated = false;
        }
        if(!$scope.openedCustomer.name.replace(/\s/g, '').length){
            var html = 'Please enter name';
            $('#CustomerName-error,#CustomerName ').addClass('error');
            $('#CustomerName-error').text(html);
            $('.errorNameCustomerName').show();
            validated = false;
        }
        if(!$scope.openedCustomer.emailId.replace(/\s/g, '').length){
            var html = 'Please enter email id';
            $('#EmailId-error,#EmailId ').addClass('error');
            $('#EmailId-error').text(html);
            $('.errorNameEmailId').show();
            validated = false;
        }else if(!validateEmail($scope.openedCustomer.emailId)){
            var html = 'Enter a valid email id';
            $('#EmailId-error,#EmailId').addClass('error');
            $('#EmailId-error').text(html);
            $('.errorNameEmailId').show();
            valid = false;
        }
        if(!$scope.openedCustomer.mobileNumber.replace(/\s/g, '').length){
            var html = 'Please enter phone number';
            $('#MobileNumber-error,#MobileNumber ').addClass('error');
            $('#MobileNumber-error').text(html);
            $('.errorNameMobileNumber').show();
            validated = false;
        }else{
            $scope.openedCustomer.mobileNumber = $scope.openedCustomer.mobileNumber.replace(/[^0-9]/g, '');
            if($scope.openedCustomer.mobileNumber.length != 10) {
                var html = 'Enter valid phone number';
                $('#MobileNumber-error,#MobileNumber ').addClass('error');
                $('#MobileNumber-error').text(html);
                $('.errorNameMobileNumber').show();
                validated = false;
            }
        }

        if(validated){
            $scope.closeModel();
            CreateService.updateCustomer($scope.openedCustomer,function(status){
                if(status == "SUCCESS"){
                    Materialize.toast('Customer updated successfully',1000);
                    $scope.$emit('refreshCustomers');
                }else if(status == "ERROR"){
                    Materialize.toast('Error in updating customer,try again',1000);
                    $scope.$emit('refreshCustomers');
                }else if(status == "FAILED"){
                    Materialize.toast('Session expired.',1000);
                    $scope.$emit('refreshCustomers');
                }
            });
        }
    };

    $scope.editCustomer = function(){
        $timeout(function(){
            $('#editCustomerModel input,#editCustomerModel select,#editCustomerModel textarea').removeAttr('disabled');
            $('#editCustomerModel #UserName').attr('disabled','disabled');
            $scope.openedCustomer.editClicked=true;
            Materialize.toast('Edit customer details.',1000);
        },0,true);
    }
    $scope.$on('editCustomer',init);
}]);


app.controller('vehicleCtr',['$scope','$timeout','CreateService','Upload','$rootScope','$location','$routeParams',function($scope,$timeout,CreateService,Upload,$rootScope,$location,$routeParams){
    $rootScope.AndroidText = 'Vehicles';
    showPreloader();
    $scope.addVehicle = function(){
        $scope.$broadcast('createVehicle');
    };

    $scope.editVehicle = function(vehicle){
        $rootScope.editVehicleClicked = vehicle;
        $scope.$broadcast('editVehicle');
    };

    var refreshVehicles = function(){
        CreateService.getVehcilesOfUser($rootScope.currentCustomer.accountId, $rootScope.currentCustomer.userId,function(status,vehicles) {
            console.log($rootScope.currentCustomer.accountId + ","+$rootScope.currentCustomer.userId+","+status);
            if(status == "SUCCESS"){
                $scope.vehicles = vehicles;
                hidePreloader();
            }else if(status=="EMPTY"){
                $scope.vehicles = [];
                hidePreloader();
                Materialize.toast('No vehicles.',1000);
            }
            else if(status == "FAILED"){
                Materialize.toast('Session expired');
                $rootScope.logout();
            }
        });
    }
    //e8f323dd-6077-4dc6-972b-51c82edf3295@inorbit.in
    var init = function(){
        $rootScope.currentCustomer = {};
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#create').trigger("click.collapse");
            $('.vehicles-li').addClass('active');
        },0,false);
        if($rootScope.userDetails.userType == 'ADMIN'){
            $scope.customers = [{'name':'None','userId':$rootScope.userDetails.userId,
                'accountId':$rootScope.userDetails.accountId}];
            $rootScope.getAllAccounts(function(status, accounts){
                if(status == "SUCCESS") {
                    for(var i=0; i < accounts.length; i++) {
                        if(accounts[i].status == 'ACTIVE') {
                            let account = {};
                            account.name = accounts[i].displayName;
                            account.id = accounts[i].id;
                            account.accountId = accounts[i].id;
                            $scope.customers.push(account);
                        }
                    }
                } else if(status=="EMPTY") {

                } else if(status == "FAILED") {
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.selectedCustomer = $scope.customers[0];
                $rootScope.currentCustomer = $scope.selectedCustomer;
                refreshVehicles();
                $rootScope.initSelect();
            });
        } else if($rootScope.userDetails.userType == 'COMPANY') {
            $scope.customers = [{'name':'None', 'userId':$rootScope.userDetails.userId,
                'accountId':$rootScope.userDetails.accountId}];
            $rootScope.getUsersOfAccount(function(status, users){
                if(status == "SUCCESS"){
                    for(var i=0; i < users.length; i++) {
                        if(users[i].type == 'VTS_USER') {
                            let user = {};
                            user.name = users[i].firstName;
                            user.id = users[i].id;
                            user.userId = users[i].id;
                            user.accountId = users[i].accountId;
                            $scope.customers.push(user);
                        }
                    }
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.selectedCustomer = $scope.customers[0];
                $rootScope.currentCustomer = $scope.selectedCustomer;
                refreshVehicles();
                $rootScope.initSelect();
            });
        } else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshVehicles();
            $rootScope.initSelect();
        }
    };
    $scope.deleteVehicle = function(vehicleId) {
        CreateService.deleteVehicle($rootScope.userDetails.accountId, $rootScope.currentCustomer.userId, vehicleId, function(status){
            if(status == "SUCCESS"){
                Materialize.toast('Vehicle deleted successfully',1000);
                refreshVehicles();
            }else{
                Materialize.toast('Error in deleting vehicle',1000);
                refreshVehicles();
            }
        });
    }
    $scope.customerChanged = function(customer) {
        $rootScope.currentCustomer = customer;
        $timeout(function(){
            refreshVehicles();
        },0,true);
    };
    $scope.$on('refreshVehicles',refreshVehicles);
    if($rootScope.userDetailsDone){
        init();
    }else{
        $scope.DetailDoneEvent = $scope.$on('DetailsDone',function(event,data){
                                    init();
                                });
    };

}]);

app.controller('createVehicleCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    var init = function(){
        $scope.imeiTimer = '';
        $scope.newDevice = {};
        $scope.newDevice.deviceImei = '';
        $scope.newDevice.deviceSim = '';
        $scope.newDevice.deviceName = '';
        $scope.newDevice.comments = '';
        $scope.newDevice.vehicleTypes = ['Lorry','Car','Bike','Bus'];
        $scope.newDevice.vehicleType = $scope.newDevice.vehicleTypes[0];
        $scope.newDevice.drivers = [{'driverId':0,'name':'None'}];
        $scope.newDevice.driver = {'driverId':0,'name':'None'};
        $scope.newDevice.selectUser = {};
        $scope.newDevice.userId = '';
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':$rootScope.userDetails.userId,'companyId':$rootScope.userDetails.companyId}];

        CreateService.getDriversOfUser($rootScope.userDetails.companyId, $rootScope.currentCustomer.userId,function(status,drivers){
            if(status == "SUCCESS"){
                $scope.newDevice.drivers = $scope.newDevice.drivers.concat(drivers);
            }
            if($rootScope.userDetails.userType == "ADMIN"){
                CreateService.getAllAdmins(function(status,customers){
                    if(status == "SUCCESS"){
                        for(var i=0; i < customers.length; i++) {
                            if(customers[i].accountActive == 'Y')
                                $scope.customers = $scope.customers.concat(customers[i]);
                        }
                    }else if(status=="EMPTY"){
                    }
                    else if(status == "FAILED"){
                        Materialize.toast('Session expired');
                        $rootScope.logout();
                    }
                    $scope.newDevice.selectUser = $rootScope.currentCustomer;

                    $('#createVehicleModel').openModal({dismissible: false},1);
                    $timeout(function(){
                        $('select').material_select();
                    },0,true);
                });
            }else if($rootScope.userDetails.userType == "COMPANY"){
                CreateService.getUsersOfAccount($rootScope.userDetails.companyId,function(status,customers){
                    if(status == "SUCCESS"){
                        for(var i=0; i < customers.length; i++) {
                            if(customers[i].accountActive == 'Y')
                                $scope.customers = $scope.customers.concat(customers[i]);
                        }
                    }else if(status=="EMPTY"){
                    }
                    else if(status == "FAILED"){
                        Materialize.toast('Session expired');
                        $rootScope.logout();
                    }
                    $scope.newDevice.selectUser = $rootScope.currentCustomer;

                    $('#createVehicleModel').openModal({dismissible: false},1);
                    $timeout(function(){
                        $('select').material_select();
                    },0,true);
                });
            }else if($rootScope.userDetails.userType == "USER"){
                $('#createVehicleModel').openModal({dismissible: false},1);
                $timeout(function(){
                    $('select').material_select();
                },0,true);
            }
        });
    };
    $scope.imeiChanged = function(){
        if($scope.newDevice.deviceImei.replace(/\s/g, '').length){
            var imei = $scope.newDevice.deviceImei.replace(/[^0-9]/g, '');
            if(imei.length == 15) {
                $timeout.cancel($scope.imeiTimer);
                $scope.imeiTimer = $timeout(checkImei(function(status){
                    if(!status){
                        var html = 'A vehicle exists with this imei number';
                        $('#DeviceImei,#DeviceImei-error').removeClass('success');
                        $('#DeviceImei-error,#DeviceImei').addClass('error');
                        $('#DeviceImei-error').text(html);
                        $('.errorNameDeviceImei').show();
                        validated = false;
                    }else{
                        var html = 'Valid Imei Number';
                        $('#DeviceImei,#DeviceImei-error').removeClass('error');
                        $('#DeviceImei-error,#DeviceImei').addClass('success');
                        $('#DeviceImei-error').text(html);
                        $('.errorNameDeviceImei').show();
                    }
                }),200,true);
            }else if(imei.length!=15){
                var html = 'Imei will be 15 digits';
                $('#DeviceImei-error,#DeviceImei').removeClass('success');
                $('#DeviceImei-error,#DeviceImei').addClass('error');
                $('#DeviceImei-error').text(html);
                $('.errorNameDeviceImei').show();
                validated = false;
            }
        }
    };
    $scope.inputFocused = function(type){
        $('input').removeClass('error');
        $('input').removeClass('success');
        $('.errorName').hide();
    };
    $scope.closeModel = function(){
        $('#createVehicleModel').closeModal();
    }
    $scope.saveVehicle = function(){
        var validated = true;
        if(!$scope.newDevice.deviceName.replace(/\s/g, '').length){
            var html = 'Please enter name.';
            $('#DeviceName,#UserName-error').removeClass('success');
            $('#DeviceName-error,#DeviceName').addClass('error');
            $('#DeviceName-error').text(html);
            $('.errorNameDeviceName').show();
            validated = false;
        }
        if(!$scope.newDevice.deviceSim.replace(/\s/g, '').length){
            var html = 'Please enter sim number';
            $('#DeviceSim-error,#DeviceSim').removeClass('success');
            $('#DeviceSim-error,#DeviceSim').addClass('error');
            $('#DeviceSim-error').text(html);
            $('.errorNameDeviceSim').show();
            validated = false;
        }else{
            $scope.newDevice.deviceSim = $scope.newDevice.deviceSim.replace(/[^0-9]/g, '');
            if($scope.newDevice.deviceSim.length != 10) {
                var html = 'Enter valid mobile number';
                $('#DeviceSim-error,#DeviceSim').removeClass('success');
                $('#DeviceSim-error,#DeviceSim').addClass('error');
                $('#DeviceSim-error').text(html);
                $('.errorNameDeviceSim').show();
                validated = false;
            }
        }
        if(!$scope.newDevice.deviceImei.replace(/\s/g, '').length){
            var html = 'Please enter imei number';
            $('#DeviceImei-error,#DeviceImei').removeClass('success');
            $('#DeviceImei-error,#DeviceImei').addClass('error');
            $('#DeviceImei-error').text(html);
            $('.errorNameDeviceImei').show();
            validated = false;
        }else{
            $scope.newDevice.deviceImei = $scope.newDevice.deviceImei.replace(/[^0-9]/g, '');
            if($scope.newDevice.deviceImei.length != 15) {
                var html = 'Enter valid imei number';
                $('#DeviceImei-error,#DeviceImei').removeClass('success');
                $('#DeviceImei-error,#DeviceImei').addClass('error');
                $('#DeviceImei-error').text(html);
                $('.errorNameDeviceImei').show();
                validated = false;
            }
        }

        if(validated){
            checkImei(function(status){
                if(!status){
                    var html = 'A vehicle exists with this imei number';
                    $('#DeviceImei-error,#DeviceImei').removeClass('success');
                    $('#DeviceImei-error,#DeviceImei').addClass('error');
                    $('#DeviceImei-error').text(html);
                    $('.errorNameDeviceImei').show();
                    return;
                }else{
                    $scope.closeModel();

                    if($rootScope.userDetails.userType == "ADMIN")
                        $scope.newDevice.userId = $scope.newDevice.selectUser.userId;
                    else if($rootScope.userDetails.userType == "COMPANY")
                        $scope.newDevice.userId = $scope.newDevice.selectUser.userId;
                    else
                        $scope.newDevice.userId = $rootScope.userDetails.userId;

                    CreateService.saveVehicle($scope.newDevice,function(status){
                        if(status == "SUCCESS"){
                            Materialize.toast('Vehicle created successfully',1000);
                            $scope.$emit('refreshVehicles');
                        }else if(status == "ERROR"){
                            Materialize.toast('Error in creating vehicle,try again',1000);
                            $scope.$emit('refreshVehicles');
                        }else if(status == "FAILED"){
                            Materialize.toast('Session expired.',1000);
                            $rootScope.logout();
                        }
                    });
                }
            });
        }
    };

    var checkImei = function(cb){
        var deviceImei = $scope.newDevice.deviceImei;
        var url='/api/VtsDevices/CheckImei?deviceImei='+deviceImei;
        $http({
          method: 'GET',
          url: url
        }).then(function successCallback(response) {
            var status = response.data.returnStatus;
            if(status == 'SUCCESS'){
                cb(true);
            }else{
                cb(false);
            }
        },function errorCallback(response){
            cb(false);
        });
    };
    $scope.$on('createVehicle',init);
}]);

app.controller('editVehicleCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    var init = function(){
        $scope.imeiTimer = '';
        $scope.openedDevice = {};
        $scope.openedDevice.editClicked=false;
        $scope.openedDevice.deviceId = $rootScope.editVehicleClicked.deviceId;
        $scope.openedDevice.deviceImei = $rootScope.editVehicleClicked.deviceImei;
        $scope.openedDevice.deviceSim = $rootScope.editVehicleClicked.deviceSim;
        $scope.openedDevice.deviceName = $rootScope.editVehicleClicked.deviceName;
        $scope.openedDevice.comments = $rootScope.editVehicleClicked.comments;
        $scope.openedDevice.vehicleTypes = ['Lorry','Car','Bike','Bus'];
        $scope.openedDevice.vehicleType = $rootScope.editVehicleClicked.vehicleType;
        $scope.openedDevice.drivers = [{'driverId':0,'name':'None'}];
        $scope.openedDevice.selectUser = {};
        $scope.openedDevice.userId = '';
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':$rootScope.userDetails.userId,'companyId':$rootScope.userDetails.companyId}];

        CreateService.getDriversOfUser($rootScope.userDetails.companyId,$rootScope.currentCustomer.userId,function(status,drivers){
            if(status == "SUCCESS"){
                $scope.openedDevice.drivers = $scope.openedDevice.drivers.concat(drivers);
            }
            if($rootScope.editVehicleClicked.driverId == 0)
                $scope.openedDevice.driver = {'driverId':0,'name':'None'};
            else{
                var found = false;
                for(var i=0;i<$scope.openedDevice.drivers.length;i++){
                    if($rootScope.editVehicleClicked.driverId == $scope.openedDevice.drivers[i].driverId){
                        $scope.openedDevice.driver = $scope.openedDevice.drivers[i];
                        found=true;
                        break;
                    }
                }
                if(!found){
                    $scope.openedDevice.driver = {'driverId':0,'name':'None'};
                }
            }
            if($rootScope.userDetails.userType == "ADMIN"){
                CreateService.getAllAdmins(function(status,customers){
                    if(status == "SUCCESS"){
                        for(var i=0; i < customers.length; i++) {
                            if(customers[i].accountActive == 'Y')
                                $scope.customers = $scope.customers.concat(customers[i]);
                        }
                    }else if(status=="EMPTY"){
                    }
                    else if(status == "FAILED"){
                        Materialize.toast('Session expired');
                        $rootScope.logout();
                    }
                    $scope.openedDevice.selectUser = $rootScope.currentCustomer;

                    $('#editVehicleModel').openModal({dismissible: false},1);
                    $timeout(function(){
                        $('#editVehicleModel .input-field label').addClass('active');
                        $('#editVehicleModel input,#editVehicleModel select,#editVehicleModel textarea').removeClass('error');
                        $('#editVehicleModel input,#editVehicleModel select,#editVehicleModel textarea').removeClass('success');
                        $('#editVehicleModel input,#editVehicleModel select,#editVehicleModel textarea').attr('disabled','disabled');
                        $('select').material_select();
                    },0,false);
                });
            }else if($rootScope.userDetails.userType == "COMPANY"){
                CreateService.getUsersOfAccount($rootScope.userDetails.companyId,function(status,customers){
                    if(status == "SUCCESS"){
                        for(var i=0; i < customers.length; i++) {
                            if(customers[i].accountActive == 'Y')
                                $scope.customers = $scope.customers.concat(customers[i]);
                        }
                    }else if(status=="EMPTY"){
                    }
                    else if(status == "FAILED"){
                        Materialize.toast('Session expired');
                        $rootScope.logout();
                    }
                    $scope.openedDevice.selectUser = $rootScope.currentCustomer;

                    $('#editVehicleModel').openModal({dismissible: false},1);
                    $timeout(function(){
                        $('#editVehicleModel .input-field label').addClass('active');
                        $('#editVehicleModel input,#editVehicleModel select,#editVehicleModel textarea').removeClass('error');
                        $('#editVehicleModel input,#editVehicleModel select,#editVehicleModel textarea').removeClass('success');
                        $('#editVehicleModel input,#editVehicleModel select,#editVehicleModel textarea').attr('disabled','disabled');
                        $('select').material_select();
                    },0,false);
                });
            }else if($rootScope.userDetails.userType == "USER"){
                $('#editVehicleModel').openModal({dismissible: false},1);
                $timeout(function(){
                    $('#editVehicleModel .input-field label').addClass('active');
                    $('#editVehicleModel input,#editVehicleModel select,#editVehicleModel textarea').removeClass('error');
                    $('#editVehicleModel input,#editVehicleModel select,#editVehicleModel textarea').removeClass('success');
                    $('#editVehicleModel input,#editVehicleModel select,#editVehicleModel textarea').attr('disabled','disabled');
                    $('select').material_select();
                },0,false);
            }
        });
    };
    $scope.imeiChanged = function(){
        if($scope.openedDevice.deviceImei.replace(/\s/g, '').length){
            var imei = $scope.openedDevice.deviceImei.replace(/[^0-9]/g, '');
            if(imei.length == 15) {
                $timeout.cancel($scope.imeiTimer);
                $scope.imeiTimer = $timeout(checkImei(function(status){
                    if(!status){
                        var html = 'A vehicle exists with this imei number';
                        $('#EditDeviceImei,#EditDeviceImei-error').removeClass('success');
                        $('#EditDeviceImei-error,#EditDeviceImei').addClass('error');
                        $('#EditDeviceImei-error').text(html);
                        $('.errorNameEditDeviceImei').show();
                        validated = false;
                    }else{
                        var html = 'Valid Imei Number';
                        $('#EditDeviceImei,#EditDeviceImei-error').removeClass('error');
                        $('#EditDeviceImei-error,#EditDeviceImei').addClass('success');
                        $('#EditDeviceImei-error').text(html);
                        $('.errorNameEditDeviceImei').show();
                    }
                }),200,true);
            }else if(imei.length!=15){
                var html = 'Imei will be 15 digits';
                $('#EditDeviceImei-error,#EditDeviceImei').removeClass('success');
                $('#EditDeviceImei-error,#EditDeviceImei').addClass('error');
                $('#EditDeviceImei-error').text(html);
                $('.errorNameEditDeviceImei').show();
                validated = false;
            }
        }
    };
    $scope.inputFocused = function(type){
        $('input').removeClass('error');
        $('input').removeClass('success');
        $('.errorName').hide();
    };
    $scope.closeModel = function(){
        $('#editVehicleModel').closeModal();
    }
    $scope.saveVehicle = function(){
        var validated = true;
        if(!$scope.openedDevice.deviceName.replace(/\s/g, '').length){
            var html = 'Please enter name.';
            $('#EditDeviceName,#EditDeviceName-error').removeClass('success');
            $('#EditDeviceName-error,#EditDeviceName').addClass('error');
            $('#EditDeviceName-error').text(html);
            $('.errorNameEditDeviceName').show();
            validated = false;
        }
        if(!$scope.openedDevice.deviceSim.replace(/\s/g, '').length){
            var html = 'Please enter sim number';
            $('#EditDeviceSim-error,#EditDeviceSim').removeClass('success');
            $('#EditDeviceSim-error,#EditDeviceSim').addClass('error');
            $('#EditDeviceSim-error').text(html);
            $('.errorNameEditDeviceSim').show();
            validated = false;
        }else{
            $scope.openedDevice.deviceSim = $scope.openedDevice.deviceSim.replace(/[^0-9]/g, '');
            if($scope.openedDevice.deviceSim.length != 10) {
                var html = 'Enter valid mobile number';
                $('#EditDeviceSim-error,#EditDeviceSim').removeClass('success');
                $('#EditDeviceSim-error,#EditDeviceSim').addClass('error');
                $('#EditDeviceSim-error').text(html);
                $('.errorNameEditDeviceSim').show();
                validated = false;
            }
        }
        if(!$scope.openedDevice.deviceImei.replace(/\s/g, '').length){
            var html = 'Please enter imei number';
            $('#EditDeviceImei-error,#EditDeviceImei').removeClass('success');
            $('#EditDeviceImei-error,#EditDeviceImei').addClass('error');
            $('#EditDeviceImei-error').text(html);
            $('.errorNameEditDeviceImei').show();
            validated = false;
        }else{
            $scope.openedDevice.deviceImei = $scope.openedDevice.deviceImei.replace(/[^0-9]/g, '');
            if($scope.openedDevice.deviceImei.length != 15) {
                var html = 'Enter valid imei number';
                $('#EditDeviceImei-error,#EditDeviceImei').removeClass('success');
                $('#EditDeviceImei-error,#EditDeviceImei').addClass('error');
                $('#EditDeviceImei-error').text(html);
                $('.errorNameEditDeviceImei').show();
                validated = false;
            }
        }

        if(validated){
            checkImei(function(status){
                if(!status){
                    var html = 'A vehicle exists with this imei number';
                    $('#EditDeviceImei-error,#EditDeviceImei').removeClass('success');
                    $('#EditDeviceImei-error,#EditDeviceImei').addClass('error');
                    $('#EditDeviceImei-error').text(html);
                    $('.errorNameEditDeviceImei').show();
                    return;
                }else{
                    $scope.closeModel();
                    if($rootScope.userDetails.userType == "ADMIN")
                        $scope.openedDevice.userId = $scope.openedDevice.selectUser.userId;
                    else if($rootScope.userDetails.userType == "COMPANY")
                        $scope.openedDevice.userId = $scope.openedDevice.selectUser.userId;
                    else
                        $scope.openedDevice.userId = $rootScope.userDetails.userId;
                    CreateService.updateVehicle($scope.openedDevice,function(status){
                        if(status == "SUCCESS"){
                            Materialize.toast('Vehicle updated successfully',1000);
                            $scope.$emit('refreshVehicles');
                        }else if(status == "ERROR"){
                            Materialize.toast('Error in updating vehicle,try again',1000);
                            $scope.$emit('refreshVehicles');
                        }else if(status == "FAILED"){
                            Materialize.toast('Session expired.',1000);
                            $rootScope.logout();
                        }
                    });
                }
            });
        }
    };

    $scope.editVehicle = function(){
        $timeout(function(){
            $('#editVehicleModel input,#editVehicleModel select,#editVehicleModel textarea').removeAttr('disabled');
            $scope.openedDevice.editClicked=true;
            $('select').material_select();
            Materialize.toast('Edit vehicle details.',1000);
        },0,true);
    }

    var checkImei = function(cb){
        if($scope.openedDevice.deviceImei != $rootScope.editVehicleClicked.deviceImei){
            var deviceImei = $scope.openedDevice.deviceImei;
            var url='/api/VtsDevices/CheckImei?deviceImei='+deviceImei;
            $http({
              method: 'GET',
              url: url
            }).then(function successCallback(response) {
                var status = response.data.returnStatus;
                if(status == 'SUCCESS'){
                    cb(true);
                }else{
                    cb(false);
                }
            },function errorCallback(response){
                cb(false);
            });
        }else{
            cb(true);
        }
    };
    $scope.$on('editVehicle',init);
}]);


app.factory('CreateService',['$http','$rootScope','$cookies',function($http,$rootScope,$cookies){
    var CreateServices = {};

    CreateServices.getUsersOfAccount = function(accountId, callback) {
        var url = 'http://0.0.0.0:7102/api/Users/GetUsersOfAccount?accountId='+accountId;
        $http({
            method: 'GET',
            url: url,
            withCredentials : true
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.getAllChildAccounts = function(callback) {
        var url = 'http://0.0.0.0:7102/api/Accounts/ChildAccounts?accountId='+$rootScope.userDetails.accountId;
        $http({
            method: 'GET',
            url: url,
            withCredentials : true
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.saveCustomer = function(customer,callback){
        var url = 'http://0.0.0.0:7102/api/Accounts/CreateCustomer';
        $http({
            method: 'POST',
            url: url,
            data:customer,
            withCredentials : true
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.updateUser = function(customer,callback){
        var url = 'http://0.0.0.0:7102/api/Accounts/UpdateAccount';
        $http({
            method: 'POST',
            url: url,
            data:customer,
            withCredentials : true
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.deActivateCustomer = function(id, callback) {
        if($rootScope.userDetails.userType == 'ADMIN')
            var url = 'http://0.0.0.0:7102/api/Accounts/InActivateAccount?accountId='+id+'&parentAccountId='+$rootScope.userDetails.accountId;
        else if($rootScope.userDetails.userType == 'COMPANY')
            var url = 'http://0.0.0.0:7102/api/Users/InActivateUser?userId='+id+'&accountId='+$rootScope.userDetails.accountId;
        $http({
            method: 'GET',
            url: url,
            withCredentials : true
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.activateCustomer = function(id, callback){
        if($rootScope.userDetails.userType == 'ADMIN')
            var url = 'http://0.0.0.0:7102/api/Accounts/ActivateAccount?accountId='+id+'&parentAccountId='+$rootScope.userDetails.accountId;
        else if($rootScope.userDetails.userType == 'COMPANY')
            var url = 'http://0.0.0.0:7102/api/Users/ActivateUser?userId='+id+'&accountId='+$rootScope.userDetails.accountId;
        $http({
            method: 'GET',
            url: url,
            withCredentials : true
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };


    CreateServices.getVehcilesOfUser = function(accountId, userId, callback) {
        let queryString = '';
        if(accountId) {
            queryString = queryString + '?accountId='+accountId;
        }
        if(userId) {
            queryString = queryString + '&userId='+userId;
        }
        var url = 'http://0.0.0.0:7101/api/Vehicles/GetVehicles' + queryString;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.saveVehicle = function(device,callback){
        var url = 'http://0.0.0.0:7101/api/Vehicles/CreateVehicle';
        $http({
            method: 'POST',
            url: url,
            data:device
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.updateVehicle = function(device,callback){
        var url = 'http://0.0.0.0:7101/api/Vehicles/UpdateVehicle';
        $http({
            method: 'POST',
            url: url,
            data:device
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.deleteVehicle = function(accountId, userId, vehicleId, callback){
        var url = 'http://0.0.0.0:7101/api/Vehicles/DeleteVehicle?accountId='+accountId+'&userId='+userId+'&vehicleId='+vehicleId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    return CreateServices;
}]);



