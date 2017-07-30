
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
    $scope.deActivate = function(userId){
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
    $scope.activate = function(userId){
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
    var refreshCustomers = function(){
        CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
            if(status == "SUCCESS"){
                Materialize.toast('Success',1000);
                $scope.customers = customers;
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
                    $('#UserName,#UserName-error').removeClass('success');
                    $('#UserName-error,#UserName').addClass('error');
                    $('#UserName-error').text(html);
                    $('.errorNameUserName').show();
                    validated = false;
                }else{
                    var html = 'Username available';
                    $('#UserName,#UserName-error').removeClass('error');
                    $('#UserName-error,#UserName').addClass('success');
                    $('#UserName-error').text(html);
                    $('.errorNameUserName').show();
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
            $('#UserName,#UserName-error').removeClass('success');
            $('#UserName-error,#UserName').addClass('error');
            $('#UserName-error').text(html);
            $('.errorNameUserName').show();
            validated = false;
        }else {
            checkUsername(function(status){
                if(!status){
                    var html = 'Username is not available';
                    $('#UserName,#UserName-error').removeClass('success');
                    $('#UserName-error,#UserName').addClass('error');
                    $('#UserName-error').text(html);
                    $('.errorNameUserName').show();
                    validated = false;
                }else{
                    var html = 'Username available';
                    $('#UserName,#UserName-error').removeClass('error');
                    $('#UserName-error,#UserName').addClass('success');
                    $('#UserName-error').text(html);
                    $('.errorNameUserName').show();
                }
            });
        }
        if(!$scope.newCustomer.userInformation.replace(/\s/g, '').length){
            var html = 'Please enter password';
            $('#UserPassword-error,#UserPassword ').addClass('error');
            $("#UserPassword-error").text(html);
            $('.errorNameUserPassword').show();
            validated = false;
        }
        if(!$scope.newCustomer.name.replace(/\s/g, '').length){
            var html = 'Please enter name';
            $('#CustomerName-error,#CustomerName ').addClass('error');
            $('#CustomerName-error').text(html);
            $('.errorNameCustomerName').show();
            validated = false;
        }
        if(!$scope.newCustomer.emailId.replace(/\s/g, '').length){
            var html = 'Please enter email id';
            $('#EmailId-error,#EmailId ').addClass('error');
            $('#EmailId-error').text(html);
            $('.errorNameEmailId').show();
            validated = false;
        }else if(!validateEmail($scope.newCustomer.emailId)){
            var html = 'Enter a valid email id';
            $('#EmailId-error,#EmailId').addClass('error');
            $('#EmailId-error').text(html);
            $('.errorNameEmailId').show();
            valid = false;
        }
        if(!$scope.newCustomer.mobileNumber.replace(/\s/g, '').length){
            var html = 'Please enter phone number';
            $('#MobileNumber-error,#MobileNumber ').addClass('error');
            $('#MobileNumber-error').text(html);
            $('.errorNameMobileNumber').show();
            validated = false;
        }else{
            $scope.newCustomer.mobileNumber = $scope.newCustomer.mobileNumber.replace(/[^0-9]/g, '');
            if($scope.newCustomer.mobileNumber.length != 10) { 
                var html = 'Enter valid phone number';
                $('#MobileNumber-error,#MobileNumber ').addClass('error');
                $('#MobileNumber-error').text(html);
                $('.errorNameMobileNumber').show();
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
        CreateService.getVehcilesOfUser($rootScope.userDetails.companyId,$rootScope.currentCustomer.userId,function(status,vehicles){
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
        if($rootScope.userDetails.userType == 'COMPANY'){
            $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.selectedCustomer = $scope.customers[0];
                $rootScope.currentCustomer = $scope.selectedCustomer;
                refreshVehicles();
                $timeout(function(){
                    $('select').material_select();
                },0,false);
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshVehicles();
            $rootScope.initSelect();
        }
    };
    $scope.deleteVehicle = function(deviceId){
        CreateService.deleteVehicle($rootScope.userDetails.companyId,$rootScope.currentCustomer.userId,deviceId,function(status){
            if(status == "SUCCESS"){
                Materialize.toast('Vehicle deleted successfully',1000);
                refreshVehicles();
            }else{
                Materialize.toast('Error in deleting vehicle',1000);
                refreshVehicles();
            }
        });
    }
    $scope.customerChanged = function(customer){
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
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];

        CreateService.getDriversOfUser($rootScope.userDetails.companyId,$rootScope.currentCustomer.userId,function(status,drivers){
            if(status == "SUCCESS"){
                $scope.newDevice.drivers = $scope.newDevice.drivers.concat(drivers);
            }
            if($rootScope.userDetails.userType == "COMPANY"){
                CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                    if(status == "SUCCESS"){
                        $scope.customers = $scope.customers.concat(customers);
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

                    if($rootScope.userDetails.userType == "COMPANY")
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
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];

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
            if($rootScope.userDetails.userType == "COMPANY"){
                CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                    if(status == "SUCCESS"){
                        $scope.customers = $scope.customers.concat(customers);
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

                    if($rootScope.userDetails.userType == "COMPANY")
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

app.controller('driverCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    $rootScope.AndroidText = 'Drivers'
    showPreloader();
    $scope.addDriver = function(){
        $scope.$broadcast('createDriver');
    }
    $scope.editDriver = function(driver){
        $rootScope.editDriverClicked = driver;
        $scope.$broadcast('editDriver');
    };
    var refreshDrivers = function(){
        CreateService.getDriversOfUser($rootScope.userDetails.companyId,$rootScope.currentCustomer.userId,function(status,drivers){
            if(status == "SUCCESS"){
                $scope.drivers = drivers;
                hidePreloader();
            }else if(status=="EMPTY"){
                $scope.drivers = [];
                hidePreloader();
                Materialize.toast('No drivers.',1000);
            }
            else if(status == "FAILED"){
                Materialize.toast('Session expired');
                $rootScope.logout();
            }
        });
    };

    $scope.deleteDriver = function(driverId){
        CreateService.deleteDriver($rootScope.userDetails.companyId,$rootScope.currentCustomer.userId,driverId,function(status){
            if(status == "SUCCESS"){
                Materialize.toast('Driver deleted successfully',1000);
                refreshDrivers();
            }else{
                Materialize.toast('Error in deleting vehicle',1000);
                refreshDrivers();
            }
        });
    }
    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#create').trigger("click.collapse");
            $('.drivers-li').addClass('active');
        },0,false);
        if($rootScope.userDetails.userType == 'COMPANY'){
            $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.selectedCustomer = $scope.customers[0];
                $rootScope.currentCustomer = $scope.selectedCustomer;
                refreshDrivers();
                $timeout(function(){
                    $('select').material_select();
                },0,false);
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshDrivers();
            $rootScope.initSelect();
        }
    };
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshDrivers();
    };
    $scope.$on('refreshDrivers',refreshDrivers);
    
    if($rootScope.userDetailsDone){
        init();
    }else{
        $scope.DetailDoneEvent = $scope.$on('DetailsDone',function(event,data){
                                    init();
                                });
    };
}]);

app.controller('createDriverCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    var init = function(){
        $scope.newDriver = {};
        $scope.newDriver.name = '';
        $scope.newDriver.mobileNumber = '';
        $scope.newDriver.emailId = '';
        $scope.newDriver.selectUser = {};
        $scope.newDriver.userId = '';
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];

        if($rootScope.userDetails.userType == "COMPANY"){
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.newDriver.selectUser = $rootScope.currentCustomer;
                $('#createDriverModel').openModal({dismissible: false},1);
                $timeout(function(){
                    $('select').material_select();
                },0,true);
            });
        }else if($rootScope.userDetails.userType == "USER"){
            $('#createDriverModel').openModal({dismissible: false},1);
            $timeout(function(){
                $('select').material_select();
            },0,true);
        }
    };
    $scope.inputFocused = function(type){
        $('input').removeClass('error');
        $('input').removeClass('success');
        $('.errorName').hide();
    };
    $scope.closeModel = function(){
        $('#createDriverModel').closeModal();
    }
    var validateEmail = function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    $scope.saveDriver = function(){
        var validated = true;
        if(!$scope.newDriver.name.replace(/\s/g, '').length){
            var html = 'Please enter name.';
            $('#DriverName,#DriverName-error').removeClass('success');
            $('#DriverName-error,#DriverName').addClass('error');
            $('#DriverName-error').text(html);
            $('.errorNameDriverName').show();
            validated = false;
        }
        if(!$scope.newDriver.mobileNumber.replace(/\s/g, '').length){
            var html = 'Please enter valid number';
            $('#DriverNumber-error,#DriverNumber').removeClass('success');
            $('#DriverNumber-error,#DriverNumber').addClass('error');
            $('#DriverNumber-error').text(html);
            $('.errorNameDriverNumber').show();
            validated = false;
        }else{
            $scope.newDriver.mobileNumber = $scope.newDriver.mobileNumber.replace(/[^0-9]/g, '');
            if($scope.newDriver.mobileNumber.length != 10) { 
                var html = 'Enter valid mobile number';
                $('#DriverNumber-error,#DriverNumber').removeClass('success');
                $('#DriverNumber-error,#DriverNumber').addClass('error');
                $('#DriverNumber-error').text(html);
                $('.errorNameDriverNumber').show();
                validated = false;
            }
        }
        if(!$scope.newDriver.emailId.replace(/\s/g, '').length){
            var html = 'Please enter email';
            $('#DriverEmail-error,#DriverEmail').removeClass('success');
            $('#DriverEmail-error,#DriverEmail').addClass('error');
            $('#DriverEmail-error').text(html);
            $('.errorNameDriverEmail').show();
            validated = false;
        }else{
            if(!validateEmail($scope.newDriver.emailId)) { 
                var html = 'Enter valid email';
                $('#DriverEmail-error,#DriverEmail').removeClass('success');
                $('#DriverEmail-error,#DriverEmail').addClass('error');
                $('#DriverEmail-error').text(html);
                $('.errorNameDriverEmail').show();
                validated = false;
            }
        }
        
        if(validated){
            $scope.closeModel();

            if($rootScope.userDetails.userType == "COMPANY")
                    $scope.newDriver.userId = $scope.newDriver.selectUser.userId;
            else
                $scope.newDriver.userId = $rootScope.userDetails.userId;
            CreateService.saveDriver($scope.newDriver,function(status){
                if(status == "SUCCESS"){
                    Materialize.toast('Driver created successfully',1000);
                    $scope.$emit('refreshDrivers');
                }else if(status == "ERROR"){
                    Materialize.toast('Error in creating driver,try again',1000);
                    $scope.$emit('refreshDrivers');
                }else if(status == "FAILED"){
                    Materialize.toast('Session expired.',1000);
                    $rootScope.logout();
                }
            });
        }
    };
    $scope.$on('createDriver',init);
}]);
app.controller('editDriverCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    var init = function(){
        $scope.openedDriver = {};
        $scope.openedDriver.editClicked=false;
        $scope.openedDriver.driverId = $rootScope.editDriverClicked.driverId;
        $scope.openedDriver.name = $rootScope.editDriverClicked.name;
        $scope.openedDriver.mobileNumber = $rootScope.editDriverClicked.mobileNumber;
        $scope.openedDriver.emailId = $rootScope.editDriverClicked.emailId;

        $scope.openedDriver.selectUser = {};
        $scope.openedDriver.userId = '';
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];

        if($rootScope.userDetails.userType == "COMPANY"){
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.openedDriver.selectUser = $rootScope.currentCustomer;

                $('#editDriverModel').openModal({dismissible: false},1);
                $timeout(function(){
                    $('#editDriverModel .input-field label').addClass('active');
                    $('#editDriverModel input,#editDriverModel select,#editDriverModel textarea').removeClass('error');
                    $('#editDriverModel input,#editDriverModel select,#editDriverModel textarea').removeClass('success');
                    $('#editDriverModel input,#editDriverModel select,#editDriverModel textarea').attr('disabled','disabled');
                    $('select').material_select();
                },0,false);
            });
        }else if($rootScope.userDetails.userType == "USER"){
            $('#editDriverModel').openModal({dismissible: false},1);
            $timeout(function(){
                $('#editDriverModel .input-field label').addClass('active');
                $('#editDriverModel input,#editDriverModel select,#editDriverModel textarea').removeClass('error');
                $('#editDriverModel input,#editDriverModel select,#editDriverModel textarea').removeClass('success');
                $('#editDriverModel input,#editDriverModel select,#editDriverModel textarea').attr('disabled','disabled');
                $('select').material_select();
            },0,false);
        }
    };
    $scope.inputFocused = function(type){
        $('input').removeClass('error');
        $('input').removeClass('success');
        $('.errorName').hide();
    };
    $scope.closeModel = function(){
        $('#editDriverModel').closeModal();
    };

    var validateEmail = function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    $scope.saveDriver = function(){
        var validated = true;
        if(!$scope.openedDriver.name.replace(/\s/g, '').length){
            var html = 'Please enter name.';
            $('#EditDriverName,#EditDriverName-error').removeClass('success');
            $('#EditDriverName-error,#EditDriverName').addClass('error');
            $('#EditDriverName-error').text(html);
            $('.errorNameEditDriverName').show();
            validated = false;
        }
        if(!$scope.openedDriver.mobileNumber.replace(/\s/g, '').length){
            var html = 'Please enter valid number';
            $('#EditDriverNumber-error,#EditDriverNumber').removeClass('success');
            $('#EditDriverNumber-error,#EditDriverNumber').addClass('error');
            $('#EditDriverNumber-error').text(html);
            $('.errorNameEditDriverNumber').show();
            validated = false;
        }else{
            $scope.openedDriver.mobileNumber = $scope.openedDriver.mobileNumber.replace(/[^0-9]/g, '');
            if($scope.openedDriver.mobileNumber.length != 10) { 
                var html = 'Enter valid mobile number';
                $('#EditDriverNumber-error,#EditDriverNumber').removeClass('success');
                $('#EditDriverNumber-error,#EditDriverNumber').addClass('error');
                $('#EditDriverNumber-error').text(html);
                $('.errorNameEditDriverNumber').show();
                validated = false;
            }
        }
        if(!$scope.openedDriver.emailId.replace(/\s/g, '').length){
            var html = 'Please enter email';
            $('#EditDriverEmail-error,#EditDriverEmail').removeClass('success');
            $('#EditDriverEmail-error,#EditDriverEmail').addClass('error');
            $('#EditDriverEmail-error').text(html);
            $('.errorNameEditDriverEmail').show();
            validated = false;
        }else{
            if(!validateEmail($scope.openedDriver.emailId)) { 
                var html = 'Enter valid email';
                $('#EditDriverEmail-error,#EditDriverEmail').removeClass('success');
                $('#EditDriverEmail-error,#EditDriverEmail').addClass('error');
                $('#EditDriverEmail-error').text(html);
                $('.errorNameEditDriverEmail').show();
                validated = false;
            }
        }
        
        if(validated){
            $scope.closeModel();

            if($rootScope.userDetails.userType == "COMPANY")
                    $scope.openedDriver.userId = $scope.openedDriver.selectUser.userId;
            else
                $scope.openedDriver.userId = $rootScope.userDetails.userId;

            CreateService.updateDriver($scope.openedDriver,function(status){
                if(status == "SUCCESS"){
                    Materialize.toast('Driver updated successfully',1000);
                    $scope.$emit('refreshDrivers');
                }else if(status == "ERROR"){
                    Materialize.toast('Error in updating driver,try again',1000);
                    $scope.$emit('refreshDrivers');
                }else if(status == "FAILED"){
                    Materialize.toast('Session expired.',1000);
                    $rootScope.logout();
                }
            });
        }
    };

    $scope.editDriver = function(){
        $timeout(function(){
            $('#editDriverModel input,#editDriverModel select,#editDriverModel textarea').removeAttr('disabled');
            $('select').material_select();
            $scope.openedDriver.editClicked=true;
            Materialize.toast('Edit driver details.',1000);
        },0,true);
    }
    $scope.$on('editDriver',init);
}]);

app.controller('userCtr',['$scope','$timeout','CreateService','Upload','$rootScope','$location','$routeParams',function($scope,$timeout,CreateService,Upload,$rootScope,$location,$routeParams){
    $rootScope.AndroidText = 'Users'
    showPreloader();
    $scope.addUser = function(){
        $scope.$broadcast('createUser');
    }
    $scope.editUser = function(user){
        $rootScope.editUserClicked = user;
        $scope.$broadcast('editUser');
    };
    var refreshUsers = function(){
        CreateService.getUsersOfUser($rootScope.userDetails.companyId,$rootScope.currentCustomer.userId,function(status,users){
            if(status == "SUCCESS"){
                $scope.notusers = users;
                hidePreloader();
            }else if(status=="EMPTY"){
                $scope.notusers = [];
                hidePreloader();
                Materialize.toast('No users.',1000);
            }
            else if(status == "FAILED"){
                Materialize.toast('Session expired');
                $rootScope.logout();
            }
        });
    };
    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#create').trigger("click.collapse");
            $('.users-li').addClass('active');
        },0,false);
        if($rootScope.userDetails.userType == 'COMPANY'){
            $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.selectedCustomer = $scope.customers[0];
                $rootScope.currentCustomer = $scope.selectedCustomer;
                refreshUsers();
                $timeout(function(){
                    $('select').material_select();
                },0,false);
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshUsers();
            $rootScope.initSelect();
        }
    };
    $scope.deleteUser = function(notUserId){
        CreateService.deleteUser($rootScope.userDetails.companyId,$rootScope.currentCustomer.userId,notUserId,function(status){
            if(status == "SUCCESS"){
                Materialize.toast('User deleted successfully',1000);
                refreshUsers();
            }else{
                Materialize.toast('Error in deleting user',1000);
                refreshUsers();
            }
        });
    }
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshUsers();
    };
    $scope.$on('refreshUsers',refreshUsers);
    
    if($rootScope.userDetailsDone){
        init();
    }else{
        $scope.DetailDoneEvent = $scope.$on('DetailsDone',function(event,data){
                                    init();
                                });
    }; 

}]);

app.controller('createUserCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    var init = function(){
        $scope.newUser = {};
        $scope.newUser.name = '';
        $scope.newUser.mobileNumber = '';
        $scope.newUser.emailId = '';
        $scope.newUser.selectUser = {};
        $scope.newUser.userId = '';
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];

        if($rootScope.userDetails.userType == "COMPANY"){
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.newUser.selectUser = $rootScope.currentCustomer;
                $('#createUserModel').openModal({dismissible: false},1);
                $timeout(function(){
                    $('select').material_select();
                },0,true);
            });
        }else if($rootScope.userDetails.userType == "USER"){
            $('#createUserModel').openModal({dismissible: false},1);
            $timeout(function(){
                $('select').material_select();
            },0,true);
        }
    };
    $scope.inputFocused = function(type){
        $('input').removeClass('error');
        $('input').removeClass('success');
        $('.errorName').hide();
    };
    $scope.closeModel = function(){
        $('#createUserModel').closeModal();
    }
    var validateEmail = function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    $scope.saveUser = function(){
        var validated = true;
        if(!$scope.newUser.name.replace(/\s/g, '').length){
            var html = 'Please enter name.';
            $('#UserName,#UserName-error').removeClass('success');
            $('#UserName-error,#UserName').addClass('error');
            $('#UserName-error').text(html);
            $('.errorNameUserName').show();
            validated = false;
        }
        if(!$scope.newUser.mobileNumber.replace(/\s/g, '').length){
            var html = 'Please enter valid number';
            $('#UserNumber-error,#UserNumber').removeClass('success');
            $('#UserNumber-error,#UserNumber').addClass('error');
            $('#UserNumber-error').text(html);
            $('.errorNameUserNumber').show();
            validated = false;
        }else{
            $scope.newUser.mobileNumber = $scope.newUser.mobileNumber.replace(/[^0-9]/g, '');
            if($scope.newUser.mobileNumber.length != 10) { 
                var html = 'Enter valid mobile number';
                $('#UserNumber-error,#UserNumber').removeClass('success');
                $('#UserNumber-error,#UserNumber').addClass('error');
                $('#UserNumber-error').text(html);
                $('.errorNameUserNumber').show();
                validated = false;
            }
        }
        if(!$scope.newUser.emailId.replace(/\s/g, '').length){
            var html = 'Please enter email';
            $('#UserEmail-error,#UserEmail').removeClass('success');
            $('#UserEmail-error,#UserEmail').addClass('error');
            $('#UserEmail-error').text(html);
            $('.errorNameUserEmail').show();
            validated = false;
        }else{
            if(!validateEmail($scope.newUser.emailId)) { 
                var html = 'Enter valid email';
                $('#UserEmail-error,#UserEmail').removeClass('success');
                $('#UserEmail-error,#UserEmail').addClass('error');
                $('#UserEmail-error').text(html);
                $('.errorNameUserEmail').show();
                validated = false;
            }
        }
        
        if(validated){
            $scope.closeModel();
            if($rootScope.userDetails.userType == "COMPANY")
                    $scope.newUser.userId = $scope.newUser.selectUser.userId;
            else
                $scope.newUser.userId = $rootScope.userDetails.userId;
            CreateService.saveUser($scope.newUser,function(status){
                if(status == "SUCCESS"){
                    Materialize.toast('User created successfully',1000);
                    $scope.$emit('refreshUsers');
                }else if(status == "ERROR"){
                    Materialize.toast('Error in creating driver,try again',1000);
                    $scope.$emit('refreshUsers');
                }else if(status == "FAILED"){
                    Materialize.toast('Session expired.',1000);
                    $rootScope.logout();
                }
            });
        }
    };
    $scope.$on('createUser',init);
}]);

app.controller('editUserCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    var init = function(){
        $scope.openedUser = {};
        $scope.openedUser.editClicked = false;
        $scope.openedUser.notUserId = $rootScope.editUserClicked.notUserId;
        $scope.openedUser.name = $rootScope.editUserClicked.name;
        $scope.openedUser.mobileNumber = $rootScope.editUserClicked.mobileNumber;
        $scope.openedUser.emailId = $rootScope.editUserClicked.emailId;
        $scope.openedUser.selectUser = {};
        $scope.openedUser.userId = '';
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];

        if($rootScope.userDetails.userType == "COMPANY"){
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.openedUser.selectUser = $rootScope.currentCustomer;

                $('#editUserModel').openModal({dismissible: false},1);
                $timeout(function(){
                    $('#editUserModel .input-field label').addClass('active');
                    $('#editUserModel input,#editUserModel select,#editUserModel textarea').removeClass('error');
                    $('#editUserModel input,#editUserModel select,#editUserModel textarea').removeClass('success');
                    $('#editUserModel input,#editUserModel select,#editUserModel textarea').attr('disabled','disabled');
                    $('select').material_select();
                },0,false);
            });
        }else if($rootScope.userDetails.userType == "USER"){
            $('#editUserModel').openModal({dismissible: false},1);
            $timeout(function(){
                $('#editUserModel .input-field label').addClass('active');
                $('#editUserModel input,#editUserModel select,#editUserModel textarea').removeClass('error');
                $('#editUserModel input,#editUserModel select,#editUserModel textarea').removeClass('success');
                $('#editUserModel input,#editUserModel select,#editUserModel textarea').attr('disabled','disabled');
                $('select').material_select();
            },0,false);
        }
    };
    $scope.inputFocused = function(type){
        $('input').removeClass('error');
        $('input').removeClass('success');
        $('.errorName').hide();
    };
    $scope.closeModel = function(){
        $('#editUserModel').closeModal();
    }
    var validateEmail = function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    $scope.saveUser = function(){
        var validated = true;
        if(!$scope.openedUser.name.replace(/\s/g, '').length){
            var html = 'Please enter name.';
            $('#EditUserName,#EditUserName-error').removeClass('success');
            $('#EditUserName-error,#EditUserName').addClass('error');
            $('#EditUserName-error').text(html);
            $('.errorNameEditUserName').show();
            validated = false;
        }
        if(!$scope.openedUser.mobileNumber.replace(/\s/g, '').length){
            var html = 'Please enter valid number';
            $('#EditUserNumber-error,#EditUserNumber').removeClass('success');
            $('#EditUserNumber-error,#EditUserNumber').addClass('error');
            $('#EditUserNumber-error').text(html);
            $('.errorNameEditUserNumber').show();
            validated = false;
        }else{
            $scope.openedUser.mobileNumber = $scope.openedUser.mobileNumber.replace(/[^0-9]/g, '');
            if($scope.openedUser.mobileNumber.length != 10) { 
                var html = 'Enter valid mobile number';
                $('#EditUserNumber-error,#EditUserNumber').removeClass('success');
                $('#EditUserNumber-error,#EditUserNumber').addClass('error');
                $('#EditUserNumber-error').text(html);
                $('.errorNameEditUserNumber').show();
                validated = false;
            }
        }
        if(!$scope.openedUser.emailId.replace(/\s/g, '').length){
            var html = 'Please enter email';
            $('#EditUserEmail-error,#EditUserEmail').removeClass('success');
            $('#EditUserEmail-error,#EditUserEmail').addClass('error');
            $('#EditUserEmail-error').text(html);
            $('.errorNameEditUserEmail').show();
            validated = false;
        }else{
            if(!validateEmail($scope.openedUser.emailId)) { 
                var html = 'Enter valid email';
                $('#EditUserEmail-error,#EditUserEmail').removeClass('success');
                $('#EditUserEmail-error,#EditUserEmail').addClass('error');
                $('#EditUserEmail-error').text(html);
                $('.errorNameEditUserEmail').show();
                validated = false;
            }
        }
        
        if(validated){
            $scope.closeModel();
            if($rootScope.userDetails.userType == "COMPANY")
                    $scope.openedUser.userId = $scope.openedUser.selectUser.userId;
            else
                $scope.openedUser.userId = $rootScope.userDetails.userId;
            CreateService.updateUser($scope.openedUser,function(status){
                if(status == "SUCCESS"){
                    Materialize.toast('User updated successfully',1000);
                    $scope.$emit('refreshUsers');
                }else if(status == "ERROR"){
                    Materialize.toast('Error in updating driver,try again',1000);
                    $scope.$emit('refreshUsers');
                }else if(status == "FAILED"){
                    Materialize.toast('Session expired.',1000);
                    $rootScope.logout();
                }
            });
        }
    };

    $scope.editUser = function(){
        $timeout(function(){
            $('#editUserModel input,#editUserModel select,#editUserModel textarea').removeAttr('disabled');
            $('select').material_select();
            $scope.openedUser.editClicked=true;
            Materialize.toast('Edit user details.',1000);
        },0,true);
    }
    $scope.$on('editUser',init);
}]);

app.controller('poiCtr',['$scope','$timeout','CreateService','Upload','$rootScope','$location',function($scope,$timeout,CreateService,Upload,$rootScope,$location){
    $rootScope.AndroidText = 'Points';
    showPreloader();
    $scope.addPoint = function(){
        $scope.$broadcast('createPoint');
    }
    $scope.editPoint = function(poi){
        $rootScope.editPointClicked = poi;
        $scope.$broadcast('editPoint');
    };
    var refreshPoints = function(){
        CreateService.getPoisOfUser($rootScope.userDetails.companyId,$rootScope.currentCustomer.userId,function(status,points){
            if(status == "SUCCESS"){
                $scope.pois = points;
                hidePreloader();
            }else if(status=="EMPTY"){
                $scope.pois = [];
                hidePreloader();
                Materialize.toast('No points.',1000);
            }
            else if(status == "FAILED"){
                Materialize.toast('Session expired');
                $rootScope.logout();
            }
        });
    };
    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#create').trigger("click.collapse");
            $('.places-li').addClass('active');
        },0,false);
        if($rootScope.userDetails.userType == 'COMPANY'){
            $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.selectedCustomer = $scope.customers[0];
                $rootScope.currentCustomer = $scope.selectedCustomer;
                refreshPoints();
                $timeout(function(){
                    $('select').material_select();
                },0,false);
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshPoints();
            $rootScope.initSelect();
        }
    };
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshPoints();
    };
    $scope.deletePoi = function(poiId){
        CreateService.deletePoi($rootScope.userDetails.companyId,$rootScope.currentCustomer.userId,poiId,function(status){
            if(status == "SUCCESS"){
                Materialize.toast('Point deleted successfully',1000);
                refreshPoints();
            }else{
                Materialize.toast('Error in deleting point',1000);
                refreshPoints();
            }
        });
    }
    $scope.$on('refreshPoints',refreshPoints);
    if($rootScope.userDetailsDone){
        init();
    }else{
        $scope.DetailDoneEvent = $scope.$on('DetailsDone',function(event,data){
                                    init();
                                });
    }; 

}]);
app.controller('createPoiCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    var init = function(){
        $scope.newPoi = {};
        $scope.newPoi.poiName = '';
        $scope.newPoi.poiLat = '17.473075';
        $scope.newPoi.poiLong = '78.482160';
        $scope.newPoi.poiAddress = '';
        $scope.poiMap = '';
        $scope.poiMarker = '';
        $scope.newPoi.selectUser = {};
        $scope.newPoi.userId = '';
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];

        if($rootScope.userDetails.userType == "COMPANY"){
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.newPoi.selectUser = $rootScope.currentCustomer;

                $('#createPointModel').openModal({dismissible: false},1);
                $timeout(function(){
                    $('select').material_select();
                    loadMap();
                },0,true);
            });
        }else if($rootScope.userDetails.userType == "USER"){
            $('#createPointModel').openModal({dismissible: false},1);
            $timeout(function(){
                $('select').material_select();
                loadMap();
            },0,true);
        }
        
    };
    var loadMap = function(){
        var mapOptions ={
                            center: new google.maps.LatLng(17.473075,78.482160),
                            zoom:15,
                            mapTypeControl:true,
                            streetViewControl:false,
                            scrollwheel: true,
                            draggable: true,
                            fullscreenControl:true
                        };
        
        $scope.poiMap = new google.maps.Map(document.getElementById('PoiMap'),mapOptions);
        var centerv = new google.maps.LatLng(17.473075,78.482160);
        $scope.poiMap.setCenter(centerv);
        $scope.poiMarker = new google.maps.Marker({
                                                position: centerv,
                                                map:$scope.poiMap,
                                                draggable: true,
                                                animation: google.maps.Animation.DROP,
                                                title:"New Poi",
                                            });
        $scope.poiMapClickListener = $scope.poiMap.addListener('click',mapClicked);
        $scope.poiMarkerDragEndListener = $scope.poiMarker.addListener('dragend',markerDraggingEnd);

    };
    var markerDraggingEnd = function(){
        $timeout(function(){
            $scope.newPoi.poiLat = $scope.poiMarker.getPosition().lat().toString().substring(0,10);
            $scope.newPoi.poiLong = $scope.poiMarker.getPosition().lng().toString().substring(0,10);
        },0,true);
    }
    var mapClicked = function(e){
        var event = e;
        $timeout(function(){
            $scope.poiMarker.setPosition(e.latLng);
            $scope.newPoi.poiLat = $scope.poiMarker.getPosition().lat().toString().substring(0,10);
            $scope.newPoi.poiLong = $scope.poiMarker.getPosition().lng().toString().substring(0,10);
        },0,true);
    }
    $scope.inputFocused = function(type){
        $('input').removeClass('error');
        $('input').removeClass('success');
        $('.errorName').hide();
    };
    $scope.closeModel = function(){
        $('#createPointModel').closeModal();
    }

    $scope.savePoi = function(){
        var validated = true;
        if(!$scope.newPoi.poiName.replace(/\s/g, '').length){
            var html = 'Please enter name.';
            $('#PointName,#PointName-error').removeClass('success');
            $('#PointName-error,#PointName').addClass('error');
            $('#PointName-error').text(html);
            $('.errorNamePointName').show();
            validated = false;
        }
        if(validated){
            $scope.closeModel();
            showPreloader();
            $rootScope.geoDecode($scope.poiMarker.getPosition(),function(address){
                $scope.newPoi.poiAddress = address;
                $scope.newPoi.poiLat = $scope.poiMarker.getPosition().lat().toString().substring(0,10);
                $scope.newPoi.poiLong = $scope.poiMarker.getPosition().lng().toString().substring(0,10);

                if($rootScope.userDetails.userType == "COMPANY")
                    $scope.newPoi.userId = $scope.newPoi.selectUser.userId;
                else
                    $scope.newPoi.userId = $rootScope.userDetails.userId;

                CreateService.savePoi($scope.newPoi,function(status){
                    if(status == "SUCCESS"){
                        Materialize.toast('Point created successfully',1000);
                        $scope.$emit('refreshPoints');
                    }else if(status == "ERROR"){
                        Materialize.toast('Error in creating Point,try again',1000);
                        $scope.$emit('refreshPoints');
                    }else if(status == "FAILED"){
                        Materialize.toast('Session expired.',1000);
                        $rootScope.logout();
                    }
                    hidePreloader();
                });
            });
        }
    };
    $scope.$on('createPoint',init);
}]);

app.controller('editPoiCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    var init = function(){
        $scope.openedPoi = {};
        $scope.openedPoi.editClicked = false;
        $scope.openedPoi.poiId = $rootScope.editPointClicked.poiId;
        $scope.openedPoi.poiName = $rootScope.editPointClicked.poiName;
        $scope.openedPoi.poiLat = $rootScope.editPointClicked.poiLat;
        $scope.openedPoi.poiLong = $rootScope.editPointClicked.poiLong;
        $scope.openedPoi.poiAddress = $rootScope.editPointClicked.poiAddress;
        $scope.poiMap = '';
        $scope.poiMarker = '';
        $scope.openedPoi.selectUser = {};
        $scope.openedPoi.userId = '';
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];

        if($rootScope.userDetails.userType == "COMPANY"){
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.openedPoi.selectUser = $rootScope.currentCustomer;

                $('#editPointModel').openModal({dismissible: false},1);
                $timeout(function(){
                    $('#editPointModel .input-field label').addClass('active');
                    $('#editPointModel input,#editPointModel select,#editPointModel textarea').removeClass('error');
                    $('#editPointModel input,#editPointModel select,#editPointModel textarea').removeClass('success');
                    $('#editPointModel select,#EditPointName').attr('disabled','disabled');
                    $('select').material_select();
                },0,false);
                $timeout(loadEditMap,0,true);
            });
        }else if($rootScope.userDetails.userType == "USER"){
            $('#editPointModel').openModal({dismissible: false},1);
            $timeout(function(){
                $('#editPointModel .input-field label').addClass('active');
                $('#editPointModel input,#editPointModel select,#editPointModel textarea').removeClass('error');
                $('#editPointModel input,#editPointModel select,#editPointModel textarea').removeClass('success');
                $('#EditPointName').attr('disabled','disabled');
                $('select').material_select();
            },0,false);
            $timeout(loadEditMap,0,true);
        }
        
    };
    var loadEditMap = function(){
        var centerv = new google.maps.LatLng($scope.openedPoi.poiLat,$scope.openedPoi.poiLong);
        var mapOptions ={
                            center: centerv,
                            zoom:15,
                            mapTypeControl:true,
                            streetViewControl:false,
                            scrollwheel: true,
                            draggable: true,
                            fullscreenControl:true
                        };
        
        $scope.poiMap = new google.maps.Map(document.getElementById('EditPoiMap'),mapOptions);
        $scope.poiMap.setCenter(centerv);
        $scope.poiMarker = new google.maps.Marker({
                                                position: centerv,
                                                map:$scope.poiMap,
                                                draggable: false,
                                                animation: google.maps.Animation.DROP,
                                                title:"Edit Poi",
                                            });

    };
    var loadSaveMap = function(){
        var centerv = new google.maps.LatLng($scope.openedPoi.poiLat,$scope.openedPoi.poiLong);
        var mapOptions ={
                            center: centerv,
                            zoom:15,
                            mapTypeControl:true,
                            streetViewControl:false,
                            scrollwheel: true,
                            draggable: true,
                            fullscreenControl:true
                        };
        
        $scope.poiMap = new google.maps.Map(document.getElementById('EditPoiMap'),mapOptions);
        $scope.poiMap.setCenter(centerv);
        $scope.poiMarker = new google.maps.Marker({
                                                position: centerv,
                                                map:$scope.poiMap,
                                                draggable: true,
                                                animation: google.maps.Animation.DROP,
                                                title:"Edit Poi",
                                            });
        $scope.poiMapClickListener = $scope.poiMap.addListener('click',mapClicked);
        $scope.poiMarkerDragEndListener = $scope.poiMarker.addListener('dragend',markerDraggingEnd);

    };
    var markerDraggingEnd = function(){
        $timeout(function(){
            $scope.openedPoi.poiLat = $scope.poiMarker.getPosition().lat().toString().substring(0,10);
            $scope.openedPoi.poiLong = $scope.poiMarker.getPosition().lng().toString().substring(0,10);
        },0,true);
    }
    var mapClicked = function(e){
        var event = e;
        $timeout(function(){
            $scope.poiMarker.setPosition(e.latLng);
            $scope.openedPoi.poiLat = $scope.poiMarker.getPosition().lat().toString().substring(0,10);
            $scope.openedPoi.poiLong = $scope.poiMarker.getPosition().lng().toString().substring(0,10);
        },0,true);
    }
    $scope.inputFocused = function(type){
        $('input').removeClass('error');
        $('input').removeClass('success');
        $('.errorName').hide();
    };
    $scope.closeModel = function(){
        $('#editPointModel').closeModal();
    }

    $scope.savePoi = function(){
        var validated = true;
        if(!$scope.openedPoi.poiName.replace(/\s/g, '').length){
            var html = 'Please enter name.';
            $('#EditPointName,#EditPointName-error').removeClass('success');
            $('#EditPointName-error,#EditPointName').addClass('error');
            $('#EditPointName-error').text(html);
            $('.errorNameEditPointName').show();
            validated = false;
        }
        if(validated){
            $scope.closeModel();
            showPreloader();
            $rootScope.geoDecode($scope.poiMarker.getPosition(),function(address){
                $scope.openedPoi.poiAddress = address;
                $scope.openedPoi.poiLat = $scope.poiMarker.getPosition().lat().toString().substring(0,10);
                $scope.openedPoi.poiLong = $scope.poiMarker.getPosition().lng().toString().substring(0,10);

                if($rootScope.userDetails.userType == "COMPANY")
                    $scope.openedPoi.userId = $scope.openedPoi.selectUser.userId;
                else
                    $scope.openedPoi.userId = $rootScope.userDetails.userId;

                CreateService.updatePoi($scope.openedPoi,function(status){
                    if(status == "SUCCESS"){
                        Materialize.toast('Point updated successfully',1000);
                        $scope.$emit('refreshPoints');
                    }else if(status == "ERROR"){
                        Materialize.toast('Error in updating Point,try again',1000);
                        $scope.$emit('refreshPoints');
                    }else if(status == "FAILED"){
                        Materialize.toast('Session expired.',1000);
                        $rootScope.logout();
                    }
                    hidePreloader();
                });
            });
        }
    };
    $scope.editPoi = function(){
        $timeout(function(){
            loadSaveMap();
            $('#editPointModel select,#EditPointName').removeAttr('disabled');
            $scope.openedPoi.editClicked=true;
            $('select').material_select();
            Materialize.toast('Edit point details.',1000);
        },0,true);
    }
    $scope.$on('editPoint',init);
}]);


app.controller('fenceCtr',['$scope','$timeout','CreateService','Upload','$rootScope','$location',function($scope,$timeout,CreateService,Upload,$rootScope,$location){
    $rootScope.AndroidText = 'Geo Fence';
    showPreloader();
    $scope.addFence = function(){
        $scope.$broadcast('createFence');
    }
    $scope.editFence = function(fence){
        $rootScope.editFenceClicked = fence;
        $scope.$broadcast('editFence');
    };
    var refreshFences = function(){
        CreateService.getFencesOfUser($rootScope.userDetails.companyId,$rootScope.currentCustomer.userId,function(status,fences){
            if(status == "SUCCESS"){
                $scope.fences = fences;
                hidePreloader();
            }else if(status=="EMPTY"){
                $scope.fences = [];
                hidePreloader();
                Materialize.toast('No fences created.',1000);
            }
            else if(status == "FAILED"){
                Materialize.toast('Session expired');
                $rootScope.logout();
            }
        });
    };
    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#create').trigger("click.collapse");
            $('.fences-li').addClass('active');
        },0,false);
        if($rootScope.userDetails.userType == 'COMPANY'){
            $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.selectedCustomer = $scope.customers[0];
                $rootScope.currentCustomer = $scope.selectedCustomer;
                refreshFences();
                $timeout(function(){
                    $('select').material_select();
                },0,false);
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshFences();
            $rootScope.initSelect();
        }
    };
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshFences();
    };
    $scope.deleteFence = function(geoFenceId){
        CreateService.deleteFence($rootScope.userDetails.companyId,$rootScope.currentCustomer.userId,geoFenceId,function(status){
            if(status == "SUCCESS"){
                Materialize.toast('Fence deleted successfully',1000);
                refreshFences();
            }else{
                Materialize.toast('Error in deleting fence',1000);
                refreshFences();
            }
        });
    }
    $scope.$on('refreshFences',refreshFences);
    if($rootScope.userDetailsDone){
        init();
    }else{
        $scope.DetailDoneEvent = $scope.$on('DetailsDone',function(event,data){
                                    init();
                                });
    }; 

}]);
app.controller('createFenceCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    var init = function(){
        $scope.newFence = {};
        $scope.newFence.geoFenceName = '';
        $scope.newFence.centerLat = '17.473075';
        $scope.newFence.centerLong = '78.482160';
        $scope.newFence.radiusInMeters = 2000;
        $scope.newFence.centerString = '';
        $scope.newFence.color = '#05CDF5';
        $scope.fenceCircle = '';
        $scope.fenceMap = '';
        $scope.fenceMarker = '';
        $scope.newFence.selectUser = {};
        $scope.newFence.userId = '';
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];

        if($rootScope.userDetails.userType == "COMPANY"){
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.newFence.selectUser = $rootScope.currentCustomer;

                $('#createFenceModel').openModal({dismissible: false},1);
                $timeout(function(){
                    $('select').material_select();
                    loadMap();
                },0,true);
            });
        }else if($rootScope.userDetails.userType == "USER"){
            $('#createFenceModel').openModal({dismissible: false},1);
            $timeout(function(){
                $('select').material_select();
                loadMap();
            },0,true);
        }
    };
    var loadMap = function(){
        var centerv = new google.maps.LatLng(17.473075,78.482160);
        var mapOptions ={
                            center: new google.maps.LatLng(17.473075,78.482160),
                            zoom:13,
                            mapTypeControl:true,
                            streetViewControl:false,
                            scrollwheel: true,
                            draggable: true,
                            fullscreenControl:true
                        };
        
        $scope.fenceMap = new google.maps.Map(document.getElementById('FenceMap'),mapOptions);
        $scope.fenceMap.setCenter(centerv);
        $scope.fenceCircle = new google.maps.Circle({
                                                    strokeColor: '#FF0000',
                                                    strokeOpacity: 0.35,
                                                    strokeWeight: 1,
                                                    fillColor: '#05CDF5',
                                                    fillOpacity: 0.15,
                                                    map: $scope.fenceMap,
                                                    center: centerv,
                                                    radius: $scope.newFence.radiusInMeters,
                                                    draggable : true,
                                                    editable : true
                                                });
        $scope.fenceMarker = new google.maps.Marker({
                                                position: centerv,
                                                map:$scope.fenceMap,
                                                draggable: true,
                                                animation: google.maps.Animation.DROP,
                                                title:"New Fence",
                                            });
        $scope.fenceMarker.bindTo("position", $scope.fenceCircle, "center");
        $scope.fenceCircle.addListener('radius_changed',radiusChanged);
        $scope.fenceCircle.addListener('center_changed',centerChanged);
        $scope.fenceMap.addListener('click',mapClicked);

    };
    var mapClicked = function(e){
        var event = e;
        $timeout(function(){
            $scope.fenceCircle.setCenter(e.latLng);
            $scope.newFence.centerLat = e.latLng.lat().toString().substring(0,10);
            $scope.newFence.centerLong = e.latLng.lng().toString().substring(0,10);
        },0,true);
    };
    var radiusChanged = function(){
        $timeout(function(){
            if($scope.fenceCircle.getRadius().toString().indexOf(".") > -1)
                $scope.newFence.radiusInMeters = $scope.fenceCircle.getRadius().toString().substring(0,$scope.fenceCircle.getRadius().toString().indexOf("."));
            else
                $scope.newFence.radiusInMeters = $scope.fenceCircle.getRadius().toString();
        },0,true);
    };
    var centerChanged = function(){
        $timeout(function(){
            $scope.newFence.centerLat = $scope.fenceCircle.getCenter().lat().toString().substring(0,10);
            $scope.newFence.centerLong = $scope.fenceCircle.getCenter().lng().toString().substring(0,10);
        },0,true);
    };
    $scope.inputFocused = function(type){
        $('input').removeClass('error');
        $('input').removeClass('success');
        $('.errorName').hide();
    };
    $scope.closeModel = function(){
        $('#createFenceModel').closeModal();
    }

    $scope.saveFence = function(){
        var validated = true;
        if(!$scope.newFence.geoFenceName.replace(/\s/g, '').length){
            var html = 'Please enter name.';
            $('#FenceName,#FenceName-error').removeClass('success');
            $('#FenceName-error,#FenceName').addClass('error');
            $('#FenceName-error').text(html);
            $('.errorNameFenceName').show();
            validated = false;
        }
        if(validated){
            $scope.closeModel();
            showPreloader();
            $rootScope.geoDecode($scope.fenceCircle.getCenter(),function(address){
                $scope.newFence.centerString = address;
                $scope.newFence.centerLat = $scope.fenceCircle.getCenter().lat().toString().substring(0,10);
                $scope.newFence.centerLong = $scope.fenceCircle.getCenter().lng().toString().substring(0,10);
                if($scope.fenceCircle.getRadius().toString().indexOf(".") > -1)
                    $scope.newFence.radiusInMeters = $scope.fenceCircle.getRadius().toString().substring(0,$scope.fenceCircle.getRadius().toString().indexOf("."));
                else
                    $scope.newFence.radiusInMeters = $scope.fenceCircle.getRadius().toString();

                if($rootScope.userDetails.userType == "COMPANY")
                    $scope.newFence.userId = $scope.newFence.selectUser.userId;
                else
                    $scope.newFence.userId = $rootScope.userDetails.userId;

                CreateService.saveFence($scope.newFence,function(status){
                    if(status == "SUCCESS"){
                        Materialize.toast('Fence created successfully',1000);
                        $scope.$emit('refreshFences');
                    }else if(status == "ERROR"){
                        Materialize.toast('Error in creating Fence,try again',1000);
                        $scope.$emit('refreshFences');
                    }else if(status == "FAILED"){
                        Materialize.toast('Session expired.',1000);
                        $rootScope.logout();
                    }
                    hidePreloader();
                });
            });
        }
    };
    $scope.$on('createFence',init);
}]);

app.controller('editFenceCtr',['$scope','$rootScope','$timeout','CreateService','$http',function($scope,$rootScope,$timeout,CreateService,$http){
    var init = function(){
        $scope.openedFence = {};
        $scope.openedFence.editClicked=false;
        $scope.openedFence.geoFenceId = $rootScope.editFenceClicked.geoFenceId;
        $scope.openedFence.geoFenceName = $rootScope.editFenceClicked.geoFenceName;
        $scope.openedFence.centerLat = $rootScope.editFenceClicked.centerLat;
        $scope.openedFence.centerLong = $rootScope.editFenceClicked.centerLong;
        $scope.openedFence.radiusInMeters = $rootScope.editFenceClicked.radiusInMeters;
        $scope.openedFence.centerString = $rootScope.editFenceClicked.centerString;
        $scope.openedFence.color = $rootScope.editFenceClicked.color;
        $scope.fenceCircle = '';
        $scope.fenceMap = '';
        $scope.fenceMarker = '';
        $scope.openedFence.selectUser = {};
        $scope.openedFence.userId = '';
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];

        if($rootScope.userDetails.userType == "COMPANY"){
            CreateService.getUsersOfCompany($rootScope.userDetails.companyId,function(status,customers){
                if(status == "SUCCESS"){
                    $scope.customers = $scope.customers.concat(customers);
                }else if(status=="EMPTY"){
                }
                else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
                $scope.openedFence.selectUser = $rootScope.currentCustomer;

                $('#editFenceModel').openModal({dismissible: false},1);
                $timeout(function(){
                    $('#editFenceModel .input-field label').addClass('active');
                    $('#editFenceModel input,#editFenceModel select,#editFenceModel textarea').removeClass('error');
                    $('#editFenceModel input,#editFenceModel select,#editFenceModel textarea').removeClass('success');
                    $('#editFenceModel select,#EditFenceName').attr('disabled','disabled');
                    $('select').material_select();
                },0,false);
                $timeout(loadEditMap,0,true);
            });
        }else if($rootScope.userDetails.userType == "USER"){
            $('#editFenceModel').openModal({dismissible: false},1);
            $timeout(function(){
                $('#editFenceModel .input-field label').addClass('active');
                $('#editFenceModel input,#editFenceModel select,#editFenceModel textarea').removeClass('error');
                $('#editFenceModel input,#editFenceModel select,#editFenceModel textarea').removeClass('success');
                $('#editFenceModel select,#EditFenceName').attr('disabled','disabled');
                $('select').material_select();
            },0,false);
            $timeout(loadEditMap,0,true);
        }
        
        
    };
    var loadEditMap = function(){
        var centerv = new google.maps.LatLng($scope.openedFence.centerLat,$scope.openedFence.centerLong);
        var mapOptions ={
                            center: centerv,
                            zoom:13,
                            mapTypeControl:true,
                            streetViewControl:false,
                            scrollwheel: true,
                            draggable: true,
                            fullscreenControl:true
                        };
        
        $scope.fenceMap = new google.maps.Map(document.getElementById('EditFenceMap'),mapOptions);
        $scope.fenceMap.setCenter(centerv);
        $scope.fenceCircle = new google.maps.Circle({
                                                    strokeColor: '#FF0000',
                                                    strokeOpacity: 0.35,
                                                    strokeWeight: 1,
                                                    fillColor: $scope.openedFence.color,
                                                    fillOpacity: 0.15,
                                                    map: $scope.fenceMap,
                                                    center: centerv,
                                                    radius: $scope.openedFence.radiusInMeters,
                                                    draggable : false,
                                                    editable : false
                                                });
        $scope.fenceMarker = new google.maps.Marker({
                                                position: centerv,
                                                map:$scope.fenceMap,
                                                draggable: false,
                                                animation: google.maps.Animation.DROP,
                                                title:"Edit Fence",
                                            });
        $scope.fenceMarker.bindTo("position", $scope.fenceCircle, "center");

    };
    var loadSaveMap = function(){
        var centerv = new google.maps.LatLng($scope.openedFence.centerLat,$scope.openedFence.centerLong);
        var mapOptions ={
                            center: centerv,
                            zoom:13,
                            mapTypeControl:true,
                            streetViewControl:false,
                            scrollwheel: true,
                            draggable: true,
                            fullscreenControl:true
                        };
        
        $scope.fenceMap = new google.maps.Map(document.getElementById('EditFenceMap'),mapOptions);
        $scope.fenceMap.setCenter(centerv);
        $scope.fenceCircle = new google.maps.Circle({
                                                    strokeColor: '#FF0000',
                                                    strokeOpacity: 0.35,
                                                    strokeWeight: 1,
                                                    fillColor: $scope.openedFence.color,
                                                    fillOpacity: 0.15,
                                                    map: $scope.fenceMap,
                                                    center: centerv,
                                                    radius: $scope.openedFence.radiusInMeters,
                                                    draggable : true,
                                                    editable : true
                                                });
        $scope.fenceMarker = new google.maps.Marker({
                                                position: centerv,
                                                map:$scope.fenceMap,
                                                draggable: true,
                                                animation: google.maps.Animation.DROP,
                                                title:"Edit Fence",
                                            });
        $scope.fenceMarker.bindTo("position", $scope.fenceCircle, "center");
        $scope.fenceCircle.addListener('radius_changed',radiusChanged);
        $scope.fenceCircle.addListener('center_changed',centerChanged);
        $scope.fenceMap.addListener('click',mapClicked);

    };


    var mapClicked = function(e){
        var event = e;
        $timeout(function(){
            $scope.fenceCircle.setCenter(e.latLng);
            $scope.openedFence.centerLat = e.latLng.lat().toString().substring(0,10);
            $scope.openedFence.centerLong = e.latLng.lng().toString().substring(0,10);
        },0,true);
    };
    var radiusChanged = function(){
        $timeout(function(){
            if($scope.fenceCircle.getRadius().toString().indexOf(".") > -1)
                $scope.openedFence.radiusInMeters = $scope.fenceCircle.getRadius().toString().substring(0,$scope.fenceCircle.getRadius().toString().indexOf("."));
            else
                $scope.openedFence.radiusInMeters = $scope.fenceCircle.getRadius().toString();
        },0,true);
    };
    var centerChanged = function(){
        $timeout(function(){
            $scope.openedFence.centerLat = $scope.fenceCircle.getCenter().lat().toString().substring(0,10);
            $scope.openedFence.centerLong = $scope.fenceCircle.getCenter().lng().toString().substring(0,10);
        },0,true);
    };
    $scope.inputFocused = function(type){
        $('input').removeClass('error');
        $('input').removeClass('success');
        $('.errorName').hide();
    };
    $scope.closeModel = function(){
        $('#editFenceModel').closeModal();
    }

    $scope.saveFence = function(){
        var validated = true;
        if(!$scope.openedFence.geoFenceName.replace(/\s/g, '').length){
            var html = 'Please enter name.';
            $('#EditFenceName,#EditFenceName-error').removeClass('success');
            $('#EditFenceName-error,#EditFenceName').addClass('error');
            $('#EditFenceName-error').text(html);
            $('.errorNameEditFenceName').show();
            validated = false;
        }
        if(validated){
            $scope.closeModel();
            showPreloader();
            $rootScope.geoDecode($scope.fenceCircle.getCenter(),function(address){

                $scope.openedFence.centerString = address;

                $scope.openedFence.centerLat = $scope.fenceCircle.getCenter().lat().toString().substring(0,10);
                $scope.openedFence.centerLong = $scope.fenceCircle.getCenter().lng().toString().substring(0,10);

                if($scope.fenceCircle.getRadius().toString().indexOf(".") > -1)
                    $scope.openedFence.radiusInMeters = $scope.fenceCircle.getRadius().toString().substring(0,$scope.fenceCircle.getRadius().toString().indexOf("."));
                else
                    $scope.openedFence.radiusInMeters = $scope.fenceCircle.getRadius().toString();
                if($rootScope.userDetails.userType == "COMPANY")
                    $scope.openedFence.userId = $scope.openedFence.selectUser.userId;
                else
                    $scope.openedFence.userId = $rootScope.userDetails.userId;

                CreateService.updateFence($scope.openedFence,function(status){
                    if(status == "SUCCESS"){
                        Materialize.toast('Fence updated successfully',1000);
                        $scope.$emit('refreshFences');
                    }else if(status == "ERROR"){
                        Materialize.toast('Error in updating Fence,try again',1000);
                        $scope.$emit('refreshFences');
                    }else if(status == "FAILED"){
                        Materialize.toast('Session expired.',1000);
                        $rootScope.logout();
                    }
                    hidePreloader();
                });
            });
        }
    };
    $scope.editFence = function(){
        $timeout(function(){
            loadSaveMap();
            $('#editFenceModel select,#EditFenceName').removeAttr('disabled');
            $scope.openedFence.editClicked=true;
            $('select').material_select();
            Materialize.toast('Edit fence details.',1000);
        },0,true);
    }
    $scope.$on('editFence',init);
}]);





app.factory('CreateService',['$http','$rootScope','$cookies',function($http,$rootScope,$cookies){
    var CreateServices = {};

    CreateServices.getUsersOfCompany = function(companyId,callback){
        var url = '/api/VtsUsers/GetCompanyUsers?companyId='+companyId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };  
    CreateServices.saveCustomer = function(customer,callback){
        var url = '/api/VtsUsers/CreateCustomer';
        $http({
            method: 'POST',
            url: url,
            data:customer
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.updateCustomer = function(customer,callback){
        var url = '/api/VtsUsers/UpdateCustomer';
        $http({
            method: 'POST',
            url: url,
            data:customer
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.deActivateCustomer = function(userId,callback){
        var url = '/api/VtsUsers/InActivateUser?userId='+userId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.activateCustomer = function(userId,callback){
        var url = '/api/VtsUsers/ActivateUser?userId='+userId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };


    CreateServices.getVehcilesOfUser = function(companyId,userId,callback){
        var url = '/api/VtsDevices/VehiclesOfUser?companyId='+companyId+'&userId='+userId;
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
        var url = '/api/VtsDevices/CreateDevice';
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
        var url = '/api/VtsDevices/UpdateDevice';
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
    CreateServices.deleteVehicle = function(companyId,userId,deviceId,callback){
        var url = '/api/VtsDevices/DeleteDevice?companyId='+companyId+'&userId='+userId+'&deviceId='+deviceId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };



    CreateServices.getDriversOfUser = function(companyId,userId,callback){
        var url = '/api/VtsDrivers/DriversOfUser?companyId='+companyId+'&userId='+userId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    CreateServices.saveDriver = function(driver,callback){
        var url = '/api/VtsDrivers/CreateDriver';
        $http({
            method: 'POST',
            url: url,
            data:driver
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.updateDriver = function(driver,callback){
        var url = '/api/VtsDrivers/UpdateDriver';
        $http({
            method: 'POST',
            url: url,
            data:driver
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.deleteDriver = function(companyId,userId,driverId,callback){
        var url = '/api/VtsDrivers/DeleteDriver?companyId='+companyId+'&userId='+userId+'&driverId='+driverId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };



    CreateServices.getUsersOfUser = function(companyId,userId,callback){
        var url = '/api/VtsNotificationUsers/UsersOfUser?companyId='+companyId+'&userId='+userId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    CreateServices.saveUser = function(user,callback){
        var url = '/api/VtsNotificationUsers/CreateUser';
        $http({
            method: 'POST',
            url: url,
            data:user
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.updateUser = function(driver,callback){
        var url = '/api/VtsNotificationUsers/UpdateNotUser';
        $http({
            method: 'POST',
            url: url,
            data:driver
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.deleteUser = function(companyId,userId,notUserId,callback){
        var url = '/api/VtsNotificationUsers/DeleteNotUser?companyId='+companyId+'&userId='+userId+'&notUserId='+notUserId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };



    CreateServices.getPoisOfUser = function(companyId,userId,callback){
        var url = '/api/VtsPois/PoisOfUser?companyId='+companyId+'&userId='+userId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    CreateServices.savePoi = function(poi,callback){
        var url = '/api/VtsPois/CreatePoi';
        $http({
            method: 'POST',
            url: url,
            data:poi
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.updatePoi = function(point,callback){
        var url = '/api/VtsPois/updatePoi';
        $http({
            method: 'POST',
            url: url,
            data:point
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.deletePoi = function(companyId,userId,poiId,callback){
        var url = '/api/VtsPois/DeletePoi?companyId='+companyId+'&userId='+userId+'&poiId='+poiId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };




    CreateServices.getFencesOfUser = function(companyId,userId,callback){
        var url = '/api/VtsGeoFencings/FencesOfUser?companyId='+companyId+'&userId='+userId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    CreateServices.saveFence = function(fence,callback){
        var url = '/api/VtsGeoFencings/CreateFence';
        $http({
            method: 'POST',
            url: url,
            data:fence
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.updateFence = function(fence,callback){
        var url = '/api/VtsGeoFencings/updateFence';
        $http({
            method: 'POST',
            url: url,
            data:fence
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    CreateServices.deleteFence = function(companyId,userId,geoFenceId,callback){
        var url = '/api/VtsGeoFencings/DeleteFence?companyId='+companyId+'&userId='+userId+'&geoFenceId='+geoFenceId;
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



