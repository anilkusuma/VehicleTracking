app.factory('ReportsService',['$http','$rootScope','$timeout',function($http,$rootScope,$timeout){
    var ReportsServices = {};
    ReportsServices.getUserVehicles = function(userId,callback){
        var url = '/api/VtsDevices/VehiclesOfUser?userId='+userId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    ReportsServices.getReport = function(vehicle,startTime,endTime,callback){
        var url = '/api/DeviceGps/GetReplay?imei='+vehicle.deviceImei+'&startTime='+startTime+'&endTime='+endTime;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData,vehicle);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    ReportsServices.getDistanceReport = function(vehicle,startTime,endTime,userId,callback){
        var url = '/api/DeviceGps/DistanceReport?imei='+vehicle.deviceImei+'&startTime='+startTime+'&endTime='+endTime+'&userId='+userId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData,vehicle);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    }; 
 
    ReportsServices.getTodayReport = function(vehicle,callback){
        var url = '/api/DeviceGps/GetTodayPackets?imei='+vehicle.deviceImei;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData,vehicle);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    }; 
    ReportsServices.getDetailReport = function(vehicle,selectedDate,callback){
        var url = '/api/DeviceGps/DetailedReport?imei='+vehicle.deviceImei+'&selDate='+selectedDate;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData,vehicle);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    ReportsServices.getOverSpeedReport = function(vehicle,startTime,endTime,minSpeed,callback){
        var url = '/api/DeviceGps/SpeedReport?imei='+vehicle.deviceImei+'&startTime='+startTime+'&endTime='+endTime+'&minSpeed='+minSpeed;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData,vehicle);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    ReportsServices.getStoppageReport = function(vehicle,startTime,endTime,minSpeed,callback){
        var url = '/api/DeviceGps/StoppageReport?imei='+vehicle.deviceImei+'&startTime='+startTime+'&endTime='+endTime+'&minStoppageTime='+minSpeed;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData,vehicle);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    ReportsServices.getGeoFenceReport = function(object,callback){
        var url = '/api/DeviceGps/FenceReport';
        $http({
            method: 'POST',
            url: url,
            data:object
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    ReportsServices.searchVehicles = function(qs,userId,callback){
        var url='/api/VtsDevices/QueryDevices?queryString='+qs+'&userId='+userId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    ReportsServices.searchFences = function(qs,userId,callback){
        var url='/api/VtsGeoFencings/QueryGeoFence?queryString='+qs+'&userId='+userId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    ReportsServices.changeReportIcons = function(){
        $timeout(function(){
            $('.dt-button span').remove();
            $('.buttons-copy').append('<i class="mdi-content-content-copy"></i>');
            $('.buttons-pdf').append('<i class="fa fa-file-pdf-o"></i>');
            $('.buttons-excel').append('<i class="fa fa-file-excel-o"></i>');
            $('.buttons-print').append('<i class="mdi-maps-local-print-shop"></i>');
            $('.buttons-copy').attr('id','copy');
            $('.buttons-pdf').attr('id','pdf');
            $('.buttons-excel').attr('id','excel');
            $('.buttons-print').attr('id','print');
            $('.dt-button').addClass('btn-floating waves-effect waves-light'); 
        },0,true);        
    }
    return ReportsServices;
}]);


app.controller('generalCtr',['$rootScope','$scope','ReportsService','$timeout','$location',function($rootScope,$scope,ReportsService,$timeout,$location){
    $rootScope.AndroidText = 'General reports';
    showPreloader();

    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#reprots').trigger("click.collapse");
            $('.dayreport-li').addClass('active');
        },0,false);
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':$rootScope.userDetails.userId,'companyId':$rootScope.userDetails.companyId}];
        $scope.dataTabel = $('#genday-table').DataTable({
                               "filter": true,
                               "destroy": true,
                               "columnDefs": [{ "type": "num", targets: 0 }],
                                  "dom": 'Blfrtip',
                                  "buttons": [
                                        'excel', 'pdf','print'
                                   ]
                            });
        ReportsService.changeReportIcons();
        if($rootScope.userDetails.userType == 'COMPANY'){
            $rootScope.getUsersOfCompany(function(status,customers){
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
                $rootScope.initSelect();
                refreshReport();
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshReport();
            $rootScope.initSelect();
        }
    };
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshReport();
    };
    var refreshReport = function(){
        $scope.fromDate = new Date();
        $scope.toDate = new Date();
        ReportsService.getUserVehicles($rootScope.currentCustomer.userId,function(status,vehicles){
            if(status == "SUCCESS"){
                $scope.vehicles = vehicles;
                hidePreloader({},function(){
                    $timeout(function(){
                        $(window).trigger('resize');
                        $rootScope.initSelect();
                    },0,true);
                });
                for(var i=0;i<$scope.vehicles.length ;i++){
                    ReportsService.getTodayReport($scope.vehicles[i],function(status,report,vehicle){
                        if(status == "SUCCESS"){
                            vehicle.packet = report;
                            var startLocation = vehicle.packet.startLocation;
                            var endLocation = vehicle.packet.endLocation;
                            startLocation = new google.maps.LatLng(startLocation.substring(0,startLocation.indexOf(",")),startLocation.substring(startLocation.indexOf(",")+1,startLocation.length));
                            endLocation = new google.maps.LatLng(endLocation.substring(0,endLocation.indexOf(",")),endLocation.substring(endLocation.indexOf(",")+1,endLocation.length));
                            $rootScope.geoDecode(startLocation,function(address){
                                vehicle.packet.startLocation = address;
                                $rootScope.geoDecode(endLocation,function(address){
                                    vehicle.packet.endLocation = address;
                                    $scope.dataTabel.row.add([0,vehicle.deviceName,vehicle.packet.startTime,vehicle.packet.startLocation,parseInt(vehicle.packet.maximumSpeed),parseFloat(vehicle.packet.averageSpeed),parseFloat(vehicle.packet.distanceCovered),vehicle.packet.numberOfStops,vehicle.packet.endLocation,vehicle.packet.endTime]);
                                    $scope.dataTabel.draw();
                                });
                            });
                        }else if(status == "ERROR"){
                            Materialize.toast('Error in fetching details for '+vehicle.deviceName,1000);
                            hidePreloader();
                        }else if(status == "EMPTY"){
                            Materialize.toast('No data for '+vehicle.deviceName,1000,'rounded');
                            hidePreloader({},function(){
                                $(window).trigger('resize');
                            });
                        }else if(status == "FAILED"){
                            Materialize.toast('Session expired');
                            $rootScope.logout();
                        }
                    });
                }
            }else if(status == "EMPTY"){
                Materialize.toast('No vehicles, add vehicles to watch replay',2000);
                $location.path('/vehicles');
            }else if(status == "FAILED" || status == "ERROR"){
                Materialize.toast('Session expired,login again',1000);
                $rootScope.logout();
            }
        });
    };

    $scope.inputFocused = function(type){
        $('.errorName').hide();
    };
    $scope.submitReport = function(){
        $scope.submittedVehicle = $scope.selectedVehicle;
        var startDate = $scope.fromDate;
        var endDate = $scope.toDate;
        var valid = true;
        if(startDate == "" || startDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#FromDate-error,.errorNameFromDate').addClass('error');
            $('#FromDate-error').text(html);
            $('.errorNameFromDate').show();
            valid = false;
        }
        if(endDate == "" || endDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#ToDate-error,.errorNameToDate').addClass('error');
            $('#ToDate-error').text(html);
            $('.errorNameToDate').show();
            valid = false;
        }
        if(moment(startDate).isAfter(moment(endDate))){
            var html = 'Please select time after start time.';
            $('#ToDate-error,.errorNameToDate').addClass('error');
            $('#ToDate-error').text(html);
            $('.errorNameToDate').show();
            valid = false;
        }
        if(valid){
            $scope.dataTabel.clear();
            $scope.dataTabel.draw();
            $scope.startTime = moment(startDate).format('YYYY-MM-DD HH:mm:SS');
            $scope.endTime = moment(endDate).format('YYYY-MM-DD HH:mm:SS');
            for(var i=0;i<$scope.vehicles.length ;i++){
                ReportsService.getReport($scope.vehicles[i],$scope.startTime,$scope.endTime,function(status,report,vehicle){
                    if(status == "SUCCESS"){
                        vehicle.packet = report;
                        var startLocation = vehicle.packet.startLocation;
                        var endLocation = vehicle.packet.endLocation;
                        startLocation = new google.maps.LatLng(startLocation.substring(0,startLocation.indexOf(",")),startLocation.substring(startLocation.indexOf(",")+1,startLocation.length));
                        endLocation = new google.maps.LatLng(endLocation.substring(0,endLocation.indexOf(",")),endLocation.substring(endLocation.indexOf(",")+1,endLocation.length));
                        $rootScope.geoDecode(startLocation,function(address){
                            vehicle.packet.startLocation = address;
                            $rootScope.geoDecode(endLocation,function(address){
                                vehicle.packet.endLocation = address;
                                $scope.dataTabel.row.add([0,vehicle.deviceName,vehicle.packet.startTime,vehicle.packet.startLocation,parseInt(vehicle.packet.maximumSpeed),parseFloat(vehicle.packet.averageSpeed),parseFloat(vehicle.packet.distanceCovered),vehicle.packet.numberOfStops,vehicle.packet.endLocation,vehicle.packet.endTime]);
                                $scope.dataTabel.draw();
                            });
                        });
                    }else if(status == "ERROR"){
                        Materialize.toast('Error in fetching details for '+vehicle.deviceName,1000);
                        hidePreloader();
                    }else if(status == "EMPTY"){
                        Materialize.toast('No data for '+vehicle.deviceName,1000,'rounded');
                        hidePreloader();
                    }else if(status == "FAILED"){
                        Materialize.toast('Session expired');
                        $rootScope.logout();
                    }
                });
            }
        }
    };

    if($rootScope.userDetailsDone){
        showPreloader();
        $timeout(init,0,false);
    }else{
        $scope.DetailDoneEvent = $scope.$on('DetailsDone',function(event,data){
                                    showPreloader();
                                    $timeout(init,0,false);
                                });
    };
}]);

app.controller('detailCtr',['$rootScope','$scope','ReportsService','$timeout','$location',function($rootScope,$scope,ReportsService,$timeout,$location){
    $rootScope.AndroidText = 'Datail Day Report';
    showPreloader();

    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#reprots').trigger("click.collapse");
            $('.detaildayreport-li').addClass('active');
        },0,false);
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':$rootScope.userDetails.userId,'companyId':$rootScope.userDetails.companyId}];
        $scope.dataTabel = $('#detailday-table').DataTable({
                               "filter": true,
                               "destroy": true,
                               "columnDefs": [{ "type": "num", targets: 0 }],
                                  "dom": 'Blfrtip',
                                  "buttons": [
                                        'excel', 'pdf','print'
                                   ]
                            });
        ReportsService.changeReportIcons();
        if($rootScope.userDetails.userType == 'COMPANY'){
            $rootScope.getUsersOfCompany(function(status,customers){
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
                $rootScope.initSelect();
                refreshReport();
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshReport();
            $rootScope.initSelect();
        }
    };
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshReport();
    };
    var refreshReport = function(){
        $scope.fromDate = new Date();
        ReportsService.getUserVehicles($rootScope.currentCustomer.userId,function(status,vehicles){
            if(status == "SUCCESS"){
                $scope.vehicles = vehicles;
                $scope.selectedVehicle = $scope.vehicles[0];
                hidePreloader({},function(){
                    $timeout(function(){
                        $(window).trigger('resize');
                        $rootScope.initSelect();
                    },0,true);
                });
                $scope.dataTabel.clear();
                $scope.dataTabel.draw();
                ReportsService.getDetailReport($scope.selectedVehicle,moment().format('YYYY-MM-DD'),function(status,packets,vehicle){
                    if(status == "SUCCESS"){
                        vehicle.packets = packets;
                        hidePreloader({},function(){
                            $timeout(function(){
                                $(window).trigger('resize');
                                processDataTables(packets,function(){
                                    $scope.dataTabel.column(0).data().sort();
                                });
                            },0,true);
                        });
                    }else if(status == "ERROR"){
                        Materialize.toast('Error in fetching details',1000);
                        hidePreloader();
                    }else if(status == "EMPTY"){
                        Materialize.toast('No data for '+vehicle.deviceName,1000,'rounded');
                        hidePreloader();
                    }else if(status == "FAILED"){
                        Materialize.toast('Session expired');
                        $rootScope.logout();
                    }
                });
            }else if(status == "EMPTY"){
                Materialize.toast('No vehicles, add vehicles to watch replay',2000);
                $location.path('/vehicles');
            }else if(status == "FAILED" || status == "ERROR"){
                Materialize.toast('Session expired,login again',1000);
                $rootScope.logout();
            }
        });
    };

    $scope.inputFocused = function(type){
        $('.errorName').hide();
    };
    $scope.submitReport = function(){
        $scope.submittedVehicle = $scope.selectedVehicle;
        var startDate = $scope.fromDate;
        var valid = true;
        if(startDate == "" || startDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#FromDate-error,.errorNameFromDate').addClass('error');
            $('#FromDate-error').text(html);
            $('.errorNameFromDate').show();
            valid = false;
        }
        if(valid){
            showPreloader();
            $scope.dataTabel.clear();
            $scope.dataTabel.draw();
            $scope.startTime = moment(startDate).format('YYYY-MM-DD');
            ReportsService.getDetailReport($scope.submittedVehicle,$scope.startTime,function(status,packets,vehicle){
                if(status == "SUCCESS"){
                    vehicle.packets = packets;
                    hidePreloader({},function(){
                        $timeout(function(){
                            $(window).trigger('resize');
                            processDataTables(packets,function(){
                                $scope.dataTabel.column(0).data().sort();
                            });
                        },0,true);
                    });
                }else if(status == "ERROR"){
                    Materialize.toast('Error in fetching details',1000);
                    hidePreloader();
                }else if(status == "EMPTY"){
                    Materialize.toast('No data for '+vehicle.deviceName,1000,'rounded');
                    hidePreloader();
                }else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
            });
        }
    };
    var processDataTables = function(packets,callback){
        var i=0;
        (function processOneRow(){
            if(i>=packets.length){
                callback();
                return;
            }else{
                var location = "";
                if(packets[i].formattedAddress == null){
                    location = packets[i].latitude+','+packets[i].longitude;
                }else{
                    location = packets[i].formattedAddress;
                }
                $scope.dataTabel.row.add([parseInt(i+1),$scope.submittedVehicle.deviceName,moment(packets[i].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss'),location,parseInt(packets[i].speed),parseFloat(packets[i].odometer),'<a class="viewOnMapLink" href="https://www.google.com/maps/place/'+packets[i].latitude+','+packets[i].longitude+'/@'+packets[i].latitude+','+packets[i].longitude+',15z/" target="_blank">View on map </a></br><div class="linkDiv" style="white-space:nowrap;">. https://www.google.com/maps/place/'+packets[i].latitude+','+packets[i].longitude+'/@'+packets[i].latitude+','+packets[i].longitude+',15z/</div>']);
                $scope.dataTabel.draw();
                i++;
                $timeout(processOneRow,0,true);
            }
        })();
    }

    if($rootScope.userDetailsDone){
        showPreloader();
        $timeout(init,0,false);
    }else{
        $scope.DetailDoneEvent = $scope.$on('DetailsDone',function(event,data){
                                    showPreloader();
                                    $timeout(init,0,false);
                                });
    };
}]);

app.controller('overSpeedCtr',['$rootScope','$scope','ReportsService','$timeout','$location',function($rootScope,$scope,ReportsService,$timeout,$location){
    $rootScope.AndroidText = 'Over Speed Report';
    showPreloader();

    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#reprots').trigger("click.collapse");
            $('.overspeedreport-li').addClass('active');
        },0,false);
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':$rootScope.userDetails.userId,'companyId':$rootScope.userDetails.companyId}];
        $scope.dataTabel = $('#overspeed-table').DataTable({
                               "filter": true,
                               "destroy": true,
                               "columnDefs": [{ "type": "num", targets: 0 }],
                                  "dom": 'Blfrtip',
                                  "buttons": [
                                        'excel', 'pdf','print'
                                   ]
                            });
        ReportsService.changeReportIcons();
        if($rootScope.userDetails.userType == 'COMPANY'){
            $rootScope.getUsersOfCompany(function(status,customers){
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
                $rootScope.initSelect();
                refreshReport();
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshReport();
            $rootScope.initSelect();
        }
    };
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshReport();
    };
    var refreshReport = function(){
        $scope.fromDate = new Date();
        $scope.speedLimit = 0;
        $scope.toDate = new Date();
        $('.speedlimit').addClass('active');
        ReportsService.getUserVehicles($rootScope.currentCustomer.userId,function(status,vehicles){
            if(status == "SUCCESS"){
                $scope.vehicles = vehicles;
                $scope.selectedVehicle = $scope.vehicles[0];
                hidePreloader({},function(){
                    $timeout(function(){
                        $(window).trigger('resize');
                        $rootScope.initSelect();
                    },0,true);
                });
                $scope.dataTabel.clear();
                $scope.dataTabel.draw();
            }else if(status == "EMPTY"){
                Materialize.toast('No vehicles, add vehicles to watch replay',2000);
                $location.path('/vehicles');
            }else if(status == "FAILED" || status == "ERROR"){
                Materialize.toast('Session expired,login again',1000);
                $rootScope.logout();
            }
        });
    };
    $scope.inputFocused = function(type){
        $('.errorName').hide();
    };
    $scope.submitReport = function(){
        $scope.submitedSpeed=$scope.speedLimit;
        $scope.submittedVehicle = $scope.selectedVehicle;
        var startDate = $scope.fromDate;
        var endDate = $scope.toDate;
        var valid = true;
        if(startDate == "" || startDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#FromDate-error,.errorNameFromDate').addClass('error');
            $('#FromDate-error').text(html);
            $('.errorNameFromDate').show();
            valid = false;
        }
        if(endDate == "" || endDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#ToDate-error,.errorNameToDate').addClass('error');
            $('#ToDate-error').text(html);
            $('.errorNameToDate').show();
            valid = false;
        }
        if(moment(startDate).isAfter(moment(endDate))){
            var html = 'Please select time after start time.';
            $('#ToDate-error,.errorNameToDate').addClass('error');
            $('#ToDate-error').text(html);
            $('.errorNameToDate').show();
            valid = false;
        }
        if($scope.speedLimit == null || $scope.speedLimit == undefined){
            var html = 'Please enter valid speed limit.';
            $('#SpeedLimit-error,.errorNameSpeedLimit').addClass('error');
            $('#SpeedLimit-error').text(html);
            $('.errorNameSpeedLimit').show();
            valid = false;
        }
        if(valid){
            showPreloader();
            $scope.dataTabel.clear();
            $scope.dataTabel.draw();
            $scope.startTime = moment(startDate).format('YYYY-MM-DD HH:mm:SS');
            $scope.endTime = moment(endDate).format('YYYY-MM-DD HH:mm:SS');
            ReportsService.getOverSpeedReport($scope.submittedVehicle,$scope.startTime,$scope.endTime,$scope.speedLimit,function(status,packets,vehicle){
                if(status == "SUCCESS"){
                    vehicle.packets = packets;
                    hidePreloader({},function(){
                        $timeout(function(){
                            $(window).trigger('resize');
                            processDataTables(packets,function(){
                                $scope.dataTabel.column(0).data().sort();
                            });
                        },0,true);
                    });
                }else if(status == "ERROR"){
                    Materialize.toast('Error in fetching details',1000);
                    hidePreloader();
                }else if(status == "EMPTY"){
                    Materialize.toast('No data for '+vehicle.deviceName,1000,'rounded');
                    hidePreloader();
                }else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
            });
        }
    };
    var processDataTables = function(packets,callback){
        var i=0;
        (function processOneRow(){
            if(i>=packets.length){
                callback();
                return;
            }else{
                var location = "";
                if(packets[i].formattedAddress == null){
                    location = packets[i].latitude+','+packets[i].longitude;
                }else{
                    location = packets[i].formattedAddress;
                }
                if(parseInt(packets[i].speed) > parseInt($scope.submitedSpeed))
                    $scope.dataTabel.row.add([parseInt(i+1),$scope.submittedVehicle.deviceName,moment(packets[i].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss'),location,parseInt(packets[i].speed),parseFloat(packets[i].odometer),'<a class="viewOnMapLink" href="https://www.google.com/maps/place/'+packets[i].latitude+','+packets[i].longitude+'/@'+packets[i].latitude+','+packets[i].longitude+',15z/" target="_blank">View on map </a></br><div class="linkDiv" style="white-space:nowrap;">. https://www.google.com/maps/place/'+packets[i].latitude+','+packets[i].longitude+'/@'+packets[i].latitude+','+packets[i].longitude+',15z/</div>']);
                $scope.dataTabel.draw();
                i++;
                $timeout(processOneRow,0,true);
            }
        })();
    }

    if($rootScope.userDetailsDone){
        showPreloader();
        $timeout(init,0,false);
    }else{
        $scope.DetailDoneEvent = $scope.$on('DetailsDone',function(event,data){
                                    showPreloader();
                                    $timeout(init,0,false);
                                });
    };
}]);

app.controller('stoppageCtr',['$rootScope','$scope','ReportsService','$timeout','$location',function($rootScope,$scope,ReportsService,$timeout,$location){
    $rootScope.AndroidText = 'Stoppage Report';
    showPreloader();

    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#reprots').trigger("click.collapse");
            $('.stoppagereport-li').addClass('active');
        },0,false);
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':$rootScope.userDetails.userId,'companyId':$rootScope.userDetails.companyId}];
        $scope.dataTabel = $('#stoppage-table').DataTable({
                               "filter": true,
                               "destroy": true,
                               "columnDefs": [{ "type": "num", targets: 0 }],
                                  "dom": 'Blfrtip',
                                  "buttons": [
                                        'excel', 'pdf','print'
                                   ]
                            });
        ReportsService.changeReportIcons();
        if($rootScope.userDetails.userType == 'COMPANY'){
            $rootScope.getUsersOfCompany(function(status,customers){
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
                $rootScope.initSelect();
                refreshReport();
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshReport();
            $rootScope.initSelect();
        }
    };
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshReport();
    };
    var refreshReport = function(){
        $scope.fromDate = new Date();
        $scope.speedLimit = 0;
        $scope.toDate = new Date();
        $('.speedlimit').addClass('active');
        ReportsService.getUserVehicles($rootScope.currentCustomer.userId,function(status,vehicles){
            if(status == "SUCCESS"){
                $scope.vehicles = vehicles;
                $scope.selectedVehicle = $scope.vehicles[0];
                hidePreloader({},function(){
                    $timeout(function(){
                        $(window).trigger('resize');
                        $rootScope.initSelect();
                    },0,true);
                });
                $scope.dataTabel.clear();
                $scope.dataTabel.draw();
            }else if(status == "EMPTY"){
                Materialize.toast('No vehicles, add vehicles to watch replay',2000);
                $location.path('/vehicles');
            }else if(status == "FAILED" || status == "ERROR"){
                Materialize.toast('Session expired,login again',1000);
                $rootScope.logout();
            }
        });
    };
    $scope.inputFocused = function(type){
        $('.errorName').hide();
    };
    $scope.submitReport = function(){
        $scope.submitedSpeed=$scope.speedLimit;
        $scope.submittedVehicle = $scope.selectedVehicle;
        var startDate = $scope.fromDate;
        var endDate = $scope.toDate;
        var valid = true;
        if(startDate == "" || startDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#FromDate-error,.errorNameFromDate').addClass('error');
            $('#FromDate-error').text(html);
            $('.errorNameFromDate').show();
            valid = false;
        }
        if(endDate == "" || endDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#ToDate-error,.errorNameToDate').addClass('error');
            $('#ToDate-error').text(html);
            $('.errorNameToDate').show();
            valid = false;
        }
        if(moment(startDate).isAfter(moment(endDate))){
            var html = 'Please select time after start time.';
            $('#ToDate-error,.errorNameToDate').addClass('error');
            $('#ToDate-error').text(html);
            $('.errorNameToDate').show();
            valid = false;
        }
        if($scope.speedLimit == null || $scope.speedLimit == undefined){
            var html = 'Please enter valid speed limit.';
            $('#SpeedLimit-error,.errorNameSpeedLimit').addClass('error');
            $('#SpeedLimit-error').text(html);
            $('.errorNameSpeedLimit').show();
            valid = false;
        }
        if(valid){
            showPreloader();
            $scope.dataTabel.clear();
            $scope.dataTabel.draw();
            $scope.startTime = moment(startDate).format('YYYY-MM-DD HH:mm:SS');
            $scope.endTime = moment(endDate).format('YYYY-MM-DD HH:mm:SS');
            ReportsService.getStoppageReport($scope.submittedVehicle,$scope.startTime,$scope.endTime,$scope.speedLimit,function(status,packets,vehicle){
                if(status == "SUCCESS"){
                    vehicle.packets = packets;
                    hidePreloader({},function(){
                        $timeout(function(){
                            $(window).trigger('resize');
                            processDataTables(packets,function(){
                                $scope.dataTabel.column(0).data().sort();
                            });
                        },0,true);
                    });
                }else if(status == "ERROR"){
                    Materialize.toast('Error in fetching details',1000);
                    hidePreloader();
                }else if(status == "EMPTY"){
                    Materialize.toast('No data for '+vehicle.deviceName,1000,'rounded');
                    hidePreloader();
                }else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
            });
        }
    };
    var processDataTables = function(packets,callback){
        var i=0;
        (function processOneRow(){
            if(i>=packets.length){
                callback();
                return;
            }else{
                $scope.dataTabel.row.add([parseInt(i+1),$scope.submittedVehicle.deviceName,moment(packets[i].stoppedTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss'),packets[i].stoppedLocation,packets[i].stoppedFor,parseFloat(packets[i].stoppedOdometer),'<a class="viewOnMapLink" href="https://www.google.com/maps/place/'+packets[i].startLat+','+packets[i].startLng+'/@'+packets[i].startLat+','+packets[i].startLng+',15z/" target="_blank">View on map </a></br><div class="linkDiv" style="white-space:nowrap;">. https://www.google.com/maps/place/'+packets[i].startLat+','+packets[i].startLng+'/@'+packets[i].startLat+','+packets[i].startLng+',15z/</div>']);
                $scope.dataTabel.draw();
                i++;
                $timeout(processOneRow,0,true);
            }
        })();
    }

    if($rootScope.userDetailsDone){
        showPreloader();
        $timeout(init,0,false);
    }else{
        $scope.DetailDoneEvent = $scope.$on('DetailsDone',function(event,data){
                                    showPreloader();
                                    $timeout(init,0,false);
                                });
    };
}]);

app.controller('geoReportsCtr',['$rootScope','$scope','ReportsService','$timeout','$location',function($rootScope,$scope,ReportsService,$timeout,$location){
    $rootScope.AndroidText = 'Geofence Report';
    showPreloader();

    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#reprots').trigger("click.collapse");
            $('.geofencereports-li').addClass('active');
        },0,false);
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':$rootScope.userDetails.userId,'companyId':$rootScope.userDetails.companyId}];
        $scope.dataTabel = $('#geofence-table').DataTable({
                               "filter": true,
                               "destroy": true,
                               "columnDefs": [{ "type": "num", targets: 0 }],
                                  "dom": 'Blfrtip',
                                  "buttons": [
                                        'excel', 'pdf','print'
                                   ]
                            });
        ReportsService.changeReportIcons();
        if($rootScope.userDetails.userType == 'COMPANY'){
            $rootScope.getUsersOfCompany(function(status,customers){
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
                $rootScope.initSelect();
                refreshReport();
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshReport();
            $rootScope.initSelect();
        }
    };
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshReport();
    };
    var refreshReport = function(){
        $scope.fromDate = new Date();
        $scope.timeInterval = 0;
        $scope.toDate = new Date();
        $scope.geo = {};
        $scope.geo.packets = [];
        $scope.geo.vehicleString = '';
        $scope.geo.fenceString = '';
        $scope.geo.vehicles = [];
        $scope.geo.fences = [];
        $scope.geo.vResponseData = [];
        $scope.geo.fResponseData = [];
        $('.timeInterval').addClass('active');
        $scope.dataTabel.clear();
        $scope.dataTabel.draw();
        hidePreloader({},function(){
            $(window).trigger('resize');
        });
    };
    $scope.inputFocused = function(type){
        $('.errorName').hide();
    };
    $scope.submitReport = function(){
        var startDate = $scope.fromDate;
        var endDate = $scope.toDate;
        var valid = true;
        if(startDate == "" || startDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#FromDate-error,.errorNameFromDate').addClass('error');
            $('#FromDate-error').text(html);
            $('.errorNameFromDate').show();
            valid = false;
        }
        if(endDate == "" || endDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#ToDate-error,.errorNameToDate').addClass('error');
            $('#ToDate-error').text(html);
            $('.errorNameToDate').show();
            valid = false;
        }
        if(moment(startDate).isAfter(moment(endDate))){
            var html = 'Please select time after start time.';
            $('#ToDate-error,.errorNameToDate').addClass('error');
            $('#ToDate-error').text(html);
            $('.errorNameToDate').show();
            valid = false;
        }
        if($scope.timeInterval == null || $scope.timeInterval == undefined){
            var html = 'Please enter valid speed limit.';
            $('#TimeInterval-error,.errorNameTimeInterval').addClass('error');
            $('#TimeInterval-error').text(html);
            $('.errorNameTimeInterval').show();
            valid = false;
        }
        if($scope.geo.vehicles.length == 0){
            var html = 'Please select atleast one vehicle.';
            $('#ToVehicles-error,.errorNameToVehicles').addClass('error');
            $('#ToVehicles-error').text(html);
            $('.errorNameToVehicles').show();
            valid = false;
        }
        if($scope.geo.fences.length == 0){
            var html = 'Please select atleast one fence.';
            $('#ToFence-error,.errorNameToFence').addClass('error');
            $('#ToFence-error').text(html);
            $('.errorNameToFence').show();
            valid = false;
        }
        if(valid){
            showPreloader();
            $scope.dataTabel.clear();
            $scope.dataTabel.draw();
            $scope.startTime = moment(startDate).format('YYYY-MM-DD HH:mm:SS');
            $scope.endTime = moment(endDate).format('YYYY-MM-DD HH:mm:SS');
            var object = {};
            object.userId = $rootScope.currentCustomer.userId;
            object.companyId = $rootScope.userDetails.companyId;
            object.startTime = $scope.startTime;
            object.endTime = $scope.endTime;
            object.vehicles = $scope.geo.vehicles;
            object.fences = $scope.geo.fences;
            object.timeInterval = $scope.timeInterval;
            ReportsService.getGeoFenceReport(object,function(status,packets){
                if(status == "SUCCESS"){
                    $scope.geo.packets = packets;
                    hidePreloader({},function(){
                        $timeout(function(){
                            $(window).trigger('resize');
                            processDataTables(packets,function(){
                                $scope.dataTabel.column(0).data().sort();
                            });
                        },0,true);
                    });
                }else if(status == "ERROR"){
                    Materialize.toast('Error in fetching details',1000);
                    hidePreloader();
                }else if(status == "EMPTY"){
                    Materialize.toast('No data ',1000,'rounded');
                    hidePreloader();
                }else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
            });
        }
    };
    var processDataTables = function(packets,callback){
        var i=0;
        (function processOneRow(){
            if(i>=packets.length){
                callback();
                return;
            }else{
                if(packets[i].duration!=0){
                    var hours = Math.floor(packets[i].duration/(60*60));
                    var min = Math.floor((packets[i].duration%(60*60))/60);
                    var seconds = (packets[i].duration%(60*60))%60;
                    packets[i].duration = hours+':'+min+':'+seconds;
                }
                $scope.dataTabel.row.add([parseInt(i+1),packets[i].deviceName,moment(packets[i].inPacket.packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss'),moment(packets[i].outPacket.packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss'),packets[i].geoFenceName,packets[i].duration]);
                $scope.dataTabel.draw();
                i++;
                $timeout(processOneRow,0,true);
            }
        })();
    }

    $scope.vInputBlurred = function(){
        $scope.geo.vResponseData = [];
    }

    $scope.vInputFocused = function(){
        $('.errorName').hide();
        if(!$scope.geo.vehicleString.replace(/\s/g, '').length){
            $scope.geo.vResponseData = [];
        }else{ 
            $scope.vAutoSuggestPopulate();
        }
    }

    $scope.vAutoSuggestPopulate = function(){
        var queryString = $scope.geo.vehicleString; 
        $timeout.cancel($scope.vTimer);   
        $scope.vTimer = $timeout(function(){
            if($scope.geo.vehicles.length>0){
                if(($scope.geo.vehicles[0].deviceId == -1) || ($scope.geo.vehicles[0].deviceName == "ALL")){
                    Materialize.toast('All vehicles are selected.',1000);
                    return false;
                }
            }
            ReportsService.searchVehicles(queryString,$rootScope.currentCustomer.userId,function(status,data){
                if(status=="SUCCESS"){
                    $scope.geo.vResponseData=[];

                    if(queryString.toUpperCase() == 'ALL' || queryString.toUpperCase() == 'A' || queryString.toUpperCase() == 'AL'){
                        var responseObject = {};
                        responseObject.id=$scope.geo.vResponseData.length;
                        responseObject.deviceName = 'ALL';
                        responseObject.deviceId = -1;
                        responseObject.selected = false;
                        $scope.geo.vResponseData.push(responseObject);
                    }
                    
                    
                    for(var i=0;i<data.length;i++){
                        var responseObject = {};
                        responseObject.id=$scope.geo.vResponseData.length;
                        responseObject.deviceName=data[i].deviceName;
                        responseObject.deviceId = data[i].deviceId;
                        responseObject.deviceImei = data[i].deviceImei;
                        responseObject.selected = false;
                        $scope.geo.vResponseData.push(responseObject);
                    }
                }else{
                    if(queryString.toUpperCase() == 'ALL' || queryString.toUpperCase() == 'A' || queryString.toUpperCase() == 'AL'){
                        $scope.geo.vResponseData=[];
                        var responseObject = {};
                        responseObject.id=$scope.geo.vResponseData.length;
                        responseObject.deviceName = 'ALL';
                        responseObject.deviceId = -1;
                        responseObject.selected = false;
                        $scope.geo.vResponseData.push(responseObject);
                    }else
                        return false;
                }
            });
        },200);
    };
    $scope.vAutoSuggestClicked = function(id){
        if($scope.geo.vResponseData[id].selected)
            $scope.geo.vResponseData[id].selected = false;
        else
            $scope.geo.vResponseData[id].selected = true;
    };
    
    $scope.vInputChanged = function($event){
        
        var keyCode = $event.keyCode;
        if (keyCode == '8' && $scope.geo.vehicleString=='') {
            if ($scope.geo.vehicles.length) {
                $scope.geo.vehicles.pop();
            }
        }
        if(!$scope.geo.vehicleString.replace(/\s/g, '').length){
            $scope.geo.vResponseData = [];
        }else{ 
            $scope.vAutoSuggestPopulate();
        }
        
    };
    
    $scope.vAutoSuggestSelected = function(){
        for(var mainLoop=0;mainLoop<$scope.geo.vResponseData.length;mainLoop++){
            if($scope.geo.vResponseData[mainLoop].selected){
                var id = mainLoop;
                var valid = true;
                if($scope.geo.vResponseData[id].deviceId == -1){
                    $scope.geo.vehicles  = [];
                    var selected = {};
                    selected.deviceId = -1;
                    selected.deviceName = 'ALL';
                    $scope.geo.vehicles.push(selected);
                    $scope.geo.vehicleString='';
                    $scope.geo.vResponseData = [];
                    return false;
                }else{
                    for(var i=0;i<$scope.geo.vehicles.length;i++){
                        if($scope.geo.vResponseData[id].deviceId == $scope.geo.vehicles[i].deviceId){
                            Materialize.toast($scope.geo.vResponseData[id].deviceName+' already added.',1000);
                            var valid = false;
                            break;
                        }
                    }
                    if(valid)
                        $scope.geo.vehicles.push($scope.geo.vResponseData[id]);
                }
            }
        }
        $scope.geo.vehicleString='';
        $scope.geo.vResponseData = [];
    };
    
    $scope.vChipClosed = function($index){
        $scope.geo.vehicles.splice($index,1);
    };

    $scope.fInputFocused = function(){
        $('.errorName').hide();
        if(!$scope.geo.fenceString.replace(/\s/g, '').length){
            $scope.geo.fResponseData = [];
        }else{
            $scope.fAutoSuggestPopulate();
        }
    }
    $scope.fInputBlurred = function(){
        $scope.geo.fResponseData = [];
    }

    $scope.fAutoSuggestPopulate = function(){
        var queryString = $scope.geo.fenceString; 
        $timeout.cancel($scope.fTimer);   
        $scope.fTimer = $timeout(function(){
            if($scope.geo.fences.length>0){
                if(($scope.geo.fences[0].id == -1) || ($scope.geo.fences[0].id == "ALL")){
                    Materialize.toast('All fences are selected.',1000);
                    return false;
                }
            }
            ReportsService.searchFences(queryString,$rootScope.currentCustomer.userId,function(status,data){
                if(status=="SUCCESS"){
                    $scope.geo.fResponseData=[];

        
                    var responseObject = {};
                    responseObject.id=$scope.geo.fResponseData.length;
                    responseObject.geoFenceName = 'ALL';
                    responseObject.geoFenceId = -1;
                    responseObject.selected = false;
                    $scope.geo.fResponseData.push(responseObject);
                    
                    
                    for(var i=0;i<data.length;i++){
                        var responseObject = {};
                        responseObject.id=$scope.geo.fResponseData.length;
                        responseObject.geoFenceName=data[i].geoFenceName;
                        responseObject.geoFenceId = data[i].geoFenceId;
                        responseObject.centerLat = data[i].centerLat;
                        responseObject.centerLong = data[i].centerLong;
                        responseObject.radiusInMeters = data[i].radiusInMeters;
                        responseObject.selected = false;
                        $scope.geo.fResponseData.push(responseObject);
                    }
                }else{
                    if(queryString.toUpperCase() == 'ALL' || queryString.toUpperCase() == 'A' || queryString.toUpperCase() == 'AL'){
                        $scope.geo.fResponseData=[];
                        var responseObject = {};
                        responseObject.id=$scope.geo.fResponseData.length;
                        responseObject.geoFenceName = 'ALL';
                        responseObject.geoFenceId = -1;
                        responseObject.selected = false;
                        $scope.geo.fResponseData.push(responseObject);
                    }else
                        return false;
                }
            });
        },200);
    };
    $scope.fAutoSuggestClicked = function(id){
        if($scope.geo.fResponseData[id].selected)
            $scope.geo.fResponseData[id].selected = false;
        else
            $scope.geo.fResponseData[id].selected = true;
    };
    
    $scope.fInputChanged = function($event){
        
        var keyCode = $event.keyCode;
        if (keyCode == '8' && $scope.geo.fenceString=='') {
            if ($scope.geo.fences.length) {
                $scope.geo.fences.pop();
            }
        }
        if(!$scope.geo.fenceString.replace(/\s/g, '').length){
            $scope.geo.fResponseData = [];
        }else{
            $scope.fAutoSuggestPopulate();
        }
        
    };
    
    $scope.fAutoSuggestSelected = function(){
        for(var mainLoop=0;mainLoop<$scope.geo.fResponseData.length;mainLoop++){
            if($scope.geo.fResponseData[mainLoop].selected){
                var id = mainLoop;
                var valid = true;
                if($scope.geo.fResponseData[id].geoFenceId == -1){
                    $scope.geo.fences  = [];
                    var selected = {};
                    selected.geoFenceId = -1;
                    selected.geoFenceName = 'ALL';
                    $scope.geo.fences.push(selected);
                    $scope.geo.fenceString='';
                    $scope.geo.fResponseData = [];
                    return false;
                }else{
                    for(var i=0;i<$scope.geo.fences.length;i++){
                        if($scope.geo.fResponseData[id].geoFenceId == $scope.geo.fences[i].geoFenceId){
                            Materialize.toast($scope.geo.fResponseData[id].geoFenceName+' already added.',1000);
                            var valid = false;
                            break;
                        }
                    }
                    if(valid)
                        $scope.geo.fences.push($scope.geo.fResponseData[id]);
                }
            }
        }
        $scope.geo.fenceString='';
        $scope.geo.fResponseData = [];
    };
    
    $scope.fChipClosed = function($index){
        $scope.geo.fences.splice($index,1);
    };
    if($rootScope.userDetailsDone){
        showPreloader();
        $timeout(init,0,false);
    }else{
        $scope.DetailDoneEvent = $scope.$on('DetailsDone',function(event,data){
                                    showPreloader();
                                    $timeout(init,0,false);
                                });
    };
}]);


app.controller('distanceReportsCtr',['$rootScope','$scope','ReportsService','$timeout','$location',function($rootScope,$scope,ReportsService,$timeout,$location){
    
    $rootScope.AndroidText = 'Distance reports';
    showPreloader();

    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#reprots').trigger("click.collapse");
            $('.distancereports-li').addClass('active');
        },0,false);
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':$rootScope.userDetails.userId,'companyId':$rootScope.userDetails.companyId}];
        $scope.dataTabel = $('#distance-table').DataTable({
                               "filter": true,
                               "destroy": true,
                               "columnDefs": [{ "type": "num", targets: 0 }],
                                  "dom": 'Blfrtip',
                                  "buttons": [
                                        'excel', 'pdf','print'
                                   ]
                            });
        ReportsService.changeReportIcons();
        if($rootScope.userDetails.userType == 'COMPANY'){
            $rootScope.getUsersOfCompany(function(status,customers){
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
                $rootScope.initSelect();
                refreshReport();
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshReport();
            $rootScope.initSelect();
        }
    };
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshReport();
    };
    var refreshReport = function(){
        $scope.fromDate = new Date();
        $scope.toDate = new Date();
        $scope.dataTabel.clear();
        $scope.dataTabel.draw();
        ReportsService.getUserVehicles($rootScope.currentCustomer.userId,function(status,vehicles){
            if(status == "SUCCESS"){
                $scope.vehicles = vehicles;
                hidePreloader({},function(){
                    $timeout(function(){
                        $(window).trigger('resize');
                        $rootScope.initSelect();
                    },0,true);
                });
            }else if(status == "EMPTY"){
                Materialize.toast('No vehicles, add vehicles to watch replay',2000);
                $location.path('/vehicles');
            }else if(status == "FAILED" || status == "ERROR"){
                Materialize.toast('Session expired,login again',1000);
                $rootScope.logout();
            }
        });
    };

    $scope.inputFocused = function(type){
        $('.errorName').hide();
    };
    $scope.submitReport = function(){
        $scope.submittedVehicle = $scope.selectedVehicle;
        var startDate = $scope.fromDate;
        var endDate = $scope.toDate;
        var valid = true;
        if(startDate == "" || startDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#FromDate-error,.errorNameFromDate').addClass('error');
            $('#FromDate-error').text(html);
            $('.errorNameFromDate').show();
            valid = false;
        }
        if(endDate == "" || endDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#ToDate-error,.errorNameToDate').addClass('error');
            $('#ToDate-error').text(html);
            $('.errorNameToDate').show();
            valid = false;
        }
        if(moment(startDate).isAfter(moment(endDate))){
            var html = 'Please select time after start time.';
            $('#ToDate-error,.errorNameToDate').addClass('error');
            $('#ToDate-error').text(html);
            $('.errorNameToDate').show();
            valid = false;
        }
        if(valid){
            $scope.dataTabel.clear();
            $scope.dataTabel.draw();
            $scope.startTime = moment(startDate).format('YYYY-MM-DD HH:mm:SS');
            $scope.endTime = moment(endDate).format('YYYY-MM-DD HH:mm:SS');
            for(var i=0;i<$scope.vehicles.length ;i++){
                ReportsService.getDistanceReport($scope.vehicles[i],$scope.startTime,$scope.endTime,$rootScope.currentCustomer.userId,function(status,report,vehicle){
                    if(status == "SUCCESS"){
                        vehicle.packet = report;
                        $scope.dataTabel.row.add([vehicle.deviceName,vehicle.packet.startTime,vehicle.packet.endTime,parseFloat(vehicle.packet.distanceCovered)]);
                        $scope.dataTabel.draw();
                    }else if(status == "ERROR"){
                        Materialize.toast('Error in fetching details for '+vehicle.deviceName,1000);
                        hidePreloader();
                    }else if(status == "EMPTY"){
                        Materialize.toast('No data for '+vehicle.deviceName,1000,'rounded');
                        hidePreloader();
                    }else if(status == "FAILED"){
                        Materialize.toast('Session expired');
                        $rootScope.logout();
                    }
                });
            }
        }
    };

    if($rootScope.userDetailsDone){
        showPreloader();
        $timeout(init,0,false);
    }else{
        $scope.DetailDoneEvent = $scope.$on('DetailsDone',function(event,data){
                                    showPreloader();
                                    $timeout(init,0,false);
                                });
    };
}]);