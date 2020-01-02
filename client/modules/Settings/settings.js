app.factory('SettingsService',['$http','$rootScope','$timeout',function($http,$rootScope,$timeout){
    var SettingsServices = {};
    SettingsServices.getVehicleData = function(vehicle,selectedDate,callback){
        var url = '/api/DeviceGps/SettingPackets?imei='+vehicle.deviceImei+'&selDate='+selectedDate;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData,vehicle);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    SettingsServices.getUserVehicles = function(userId,callback){
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
    SettingsServices.updatePacket= function(packet,callback){
        var url = '/api/DeviceGps/UpdatePacket';
        $http({
            method: 'POST',
            url: url,
            data:packet
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    SettingsServices.createPacket= function(packet,callback){
        var url = '/api/DeviceGps/CreatePacket';
        $http({
            method: 'POST',
            url: url,
            data:packet
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };

    SettingsServices.deletePacket = function(packetId,callback){
        var url = '/api/DeviceGps/DeletePacket?packetId='+packetId;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.reason);
        },function errorCallback(response) {
            callback("ERROR");
        });
    };
    return SettingsServices;
}]);

app.controller('settingsCtr',['$rootScope','$scope','SettingsService','$timeout','$location',function($rootScope,$scope,SettingsService,$timeout,$location){
    $rootScope.AndroidText = 'Settings';
    showPreloader();
    $scope.SettingsMap = "";
    $scope.pointMarkers = [];
    $scope.infoBoxes = [];
    $scope.bounds = "";
    var clearEditValues = function(){
        $scope.editPacket = {};
        $scope.editPacket.vehicleId="";
        $scope.editPacket.deviceImei="";
        $scope.editPacket.packetTime = new Date();
        $scope.editPacket.speed = 0;
        $scope.editPacket.odometer = 0;
        $scope.editPacket.latitude = 0;
        $scope.editPacket.longitude = 0;
        $scope.editPacket.packetId = -1;
    }
    clearEditValues();
    $timeout(function(){$('ul.tabs').tabs()},0,false);
    $('.tabs').on('click', '.settings-map', function () {
        $timeout(function(){
            triggerMapResize();
            fitMarkersToBounds();
        },0,true);
    });
    $('.tabs').on('click', '.settings-table', function () {
        $timeout(function(){
            $(window).trigger('resize');
        },0,false);
    });
    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#reprots').trigger("click.collapse");
            $('.detaildayreport-li').addClass('active');
        },0,false);
        loadMap();
        $scope.customers = [{'vtsUsers':{'name':'None'},'userId':$rootScope.userDetails.userId,'companyId':$rootScope.userDetails.companyId}];
        $scope.dataTabel = $('#detailday-table').DataTable({
                               "filter": true,
                               "destroy": true,
                               "columnDefs": [{ "type": "num", targets: 0 }],
                                  "dom": 'Blfrtip',
                                  "buttons": []
                            });
        $('#detailday-table tbody').on('click', 'tr', function () {
            var data = $scope.dataTabel.row(this).data();
            var packet = {};
            packet.packetId = data[0];
            packet.packetTime = moment(data[1],'DD/MM/YYYY HH:mm:ss').format('ddd MMM DD YYYY HH:mm:ss');
            packet.latitude = data[2];
            packet.longitude = data[3];
            packet.speed = data[4].toString();
            packet.odometer = data[5].toString();
            $timeout(function(){
                selectPacket(packet);
            },0,true);
        } );
        if($rootScope.userDetails.userType == 'ADMIN'){
            $scope.customers = [{'vtsUsers':{'name':'None'},'userId':$rootScope.userDetails.userId,'companyId':$rootScope.userDetails.companyId}];
            $rootScope.getAllAccounts(function(status,customers){
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
                refreshReport();
                $rootScope.initSelect();
            });
        }else if($rootScope.userDetails.userType == 'COMPANY'){
            $scope.customers = [{'vtsUsers':{'name':'None'},'userId':$rootScope.userDetails.userId,'companyId':$rootScope.userDetails.companyId}];
            $rootScope.getUsersOfAccount(function(status,customers){
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
        SettingsService.getUserVehicles($rootScope.currentCustomer.userId,function(status,vehicles){
            if(status == "SUCCESS"){
                $scope.vehicles = vehicles;
                $scope.selectedVehicle = $scope.vehicles[0];
                hidePreloader({},function(){
                    $timeout(function(){
                        $(window).trigger('resize');
                        triggerMapResize();
                        $rootScope.initSelect();
                    },0,true);
                });

                $scope.dataTabel.clear();
                $scope.dataTabel.draw();
                clearMap();
                clearEditValues();
                SettingsService.getVehicleData($scope.selectedVehicle,moment().format('YYYY-MM-DD'),function(status,packets,vehicle){
                    $scope.editPacket.vehicleId=$scope.selectedVehicle.deviceId;
                    $scope.editPacket.deviceImei=$scope.selectedVehicle.deviceImei;
                    if(status == "SUCCESS"){
                        packets = packets.reverse();
                        vehicle.packets = packets;

                        hidePreloader({},function(){
                            $timeout(function(){
                                $(window).trigger('resize');
                                processDataTables(packets,function(){
                                    $scope.dataTabel.column(0).data().sort();
                                });
                                triggerMapResize();
                                displayInMap(packets);
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
                hidePreloader();
                //$location.path('/vehicles');
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
            clearMap();
            clearEditValues();
            $scope.startTime = moment(startDate).format('YYYY-MM-DD');
            SettingsService.getVehicleData($scope.submittedVehicle,$scope.startTime,function(status,packets,vehicle){
                $scope.editPacket.vehicleId=$scope.selectedVehicle.deviceId;
                $scope.editPacket.deviceImei=$scope.selectedVehicle.deviceImei;
                if(status == "SUCCESS"){
                    packets = packets.reverse();
                    vehicle.packets = packets;
                    hidePreloader({},function(){
                        $timeout(function(){
                            $(window).trigger('resize');
                            processDataTables(packets,function(){
                                $scope.dataTabel.column(0).data().sort();
                            });
                            triggerMapResize();
                            displayInMap(packets);
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
    var loadMap = function(){
        var mapOptions ={
                            center: new google.maps.LatLng(17.473075,78.482160),
                            zoom:15,
                            mapTypeControl:true,
                            streetViewControl:false,
                            scrollwheel: false,
                            draggable: true,
                            fullscreenControl:true
                        };
        $scope.SettingsMap = new google.maps.Map(document.getElementById('SettingsMapDiv'),mapOptions);
        google.maps.event.addListener($scope.SettingsMap, 'click', function (event) {
            var e = event;
            placeMarker(e);
            setEditPacketOnClick(e);
        });
    };
    var setEditPacketOnClick = function(e){
        $timeout(function(){
            $scope.editPacket.latitude = parseFloat(e.latLng.lat().toString().substring(0,10));
            $scope.editPacket.longitude = parseFloat(e.latLng.lng().toString().substring(0,10));
            $scope.editPacket.packetId = -1;
        },0,true);
    }
    var setDotPacket = function(e,packet){
        $timeout(function(){
            packet.latitude = parseFloat(e.latLng.lat().toString().substring(0,10));
            packet.longitude = parseFloat(e.latLng.lng().toString().substring(0,10));
            selectPacket(packet);
        },0,true);
    }
    var placeMarker = function(e){
        if($scope.EditMarker == undefined){
            $scope.EditMarker = new google.maps.Marker({
                position: e.latLng,
                map: $scope.SettingsMap,
                draggable: true,
                animation: google.maps.Animation.DROP,
                title:"New Point",
            });
            //$scope.SettingsMap.panTo(e.latLng);
            google.maps.event.addListener($scope.EditMarker,'dragend',setEditPacketOnClick);
        }else{
            $scope.EditMarker.setMap($scope.SettingsMap);
            $scope.EditMarker.setPosition(e.latLng);
            $scope.SettingsMap.panTo(e.latLng);
        }
    }
    var triggerMapResize = function(){
        google.maps.event.trigger($scope.SettingsMap,'resize');
    };
    var displayInMap = function(packets,callback){
        clearMap();
        loadMap();
        for(var i=0;i<packets.length;i++){
            var point = new google.maps.LatLng(packets[i].latitude,packets[i].longitude);
            var pointMarker = new google.maps.Marker({
                                    icon     : {
                                        url     : "./images/MapsMarker.png",
                                        size    : new google.maps.Size(48,48),
                                        anchor  : new google.maps.Point(24,48)
                                    },
                                    draggable : true,
                                    position : point
                                });
            pointMarker.packet = packets[i];
            $scope.pointMarkers.push(pointMarker);
            var infoBox = createInfoBox(pointMarker);
            updateInfoBox(infoBox,i,packets[i]);
            $scope.infoBoxes.push(infoBox);
        }
        hidePreloader({},function(){
            setVariableToMap();
            triggerMapResize();
        });
    };
    var createInfoBox = function(markerv){
        var location = markerv.getPosition();
        var boxText = document.createElement("div");
        var myOptions = {
              content: boxText
            , disableAutoPan: false
            , maxWidth: 0
            , pixelOffset: new google.maps.Size(-140, 0)
            , zIndex: null
            , boxStyle: {
                background : "white",
                opacity: 0.9,
                width: "350px",
                padding : "10px",
                border: "1px solid black"
            }
            , closeBoxMargin: "10px 5px 0px 2px"
            , closeBoxURL: ""
            , infoBoxClearance: new google.maps.Size(1, 1)
            , isHidden: false
            , pane: "floatPane"
            , enableEventPropagation: true
        };
        var ib = new InfoBox(myOptions);

        google.maps.event.addListener(markerv, 'mouseover', function () {
            ib.open($scope.SettingsMap, markerv);
        });
        google.maps.event.addListener(markerv, 'mouseout', function () {
            ib.close();
        });
        google.maps.event.addListener(markerv,'click',function(){
            $timeout(function(){
                selectPacket(markerv.packet);
            },0,true);
        });
        google.maps.event.addListener($scope.SettingsMap,'click', function () {
            for(var i = 0 ; i < $scope.infoBoxes.length ; i++){
                if($scope.infoBoxes[i] !== ""){
                    $scope.infoBoxes[i].close();
                }
            }
        });
        google.maps.event.addListener(markerv,'dragend',function(e){
            setDotPacket(e,markerv.packet);
        });
        return ib;
    };

    var updateInfoBox = function(ibv,i,packet){
        var content = "Packet Number : " +packet.packetId+ "<br/>" + "Speed : " + packet.speed + " KMPH" + "<br/>" + "Time Of Data : " + moment(packet.packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss') + "<br/>" + "Distance Covered  : " +packet.odometer + " Km <br/>";
        ibv.setContent(content);
    };
    var setVariableToMap = function(){
        for(var i=0;i<$scope.pointMarkers.length;i++){
            if($scope.pointMarkers[i]!=undefined){
                $scope.pointMarkers[i].setMap($scope.SettingsMap);
            }
        }
        $timeout(function(){
            fitMarkersToBounds();
        },0,true);
    };
    var fitMarkersToBounds = function(){
        var latlngbounds = new google.maps.LatLngBounds();
        for (var i = 0; i < $scope.pointMarkers.length; i++) {
            latlngbounds.extend($scope.pointMarkers[i].getPosition());
            $scope.SettingsMap.fitBounds(latlngbounds);
        }
    }

    var clearMap = function(){
        for(var i=0;i<$scope.pointMarkers.length;i++){
            if($scope.pointMarkers[i] != undefined)
                $scope.pointMarkers[i].setMap(null);
        }
        if($scope.EditMarker != undefined)
            $scope.EditMarker.setMap(null);
        resetVariables();
    };

    var resetVariables=  function(){
        $scope.pointMarkers = [];
        $scope.infoBoxes = [];
        $scope.lastPoint = "";
        $scope.bounds = "";
        $scope.EditMarker = undefined;
    };
    var processDataTables = function(packets,callback){
        var i=0;
        (function processOneRow(){
            if(i>=packets.length){
                callback();
                return;
            }else{
                $scope.dataTabel.row.add([packets[i].packetId,moment(packets[i].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('DD/MM/YYYY HH:mm:ss'),packets[i].latitude,packets[i].longitude,parseInt(packets[i].speed),parseFloat(packets[i].odometer)]);
                $scope.dataTabel.draw();
                i++;
                $timeout(processOneRow,0,true);
            }
        })();
    };


    var selectPacket = function(packet){
        if($scope.EditMarker != undefined){
            $scope.EditMarker.setMap(null);
        }
        $scope.editPacket.packetId = packet.packetId;
        $scope.editPacket.packetTime = moment(packet.packetTime,'ddd MMM DD YYYY HH:mm:ss').toDate();
        $scope.editPacket.speed = parseInt(packet.speed);
        $scope.editPacket.odometer = parseFloat(packet.odometer);
        $scope.editPacket.latitude = parseFloat(packet.latitude);
        $scope.editPacket.longitude = parseFloat(packet.longitude);
    }

    $scope.savePacket = function(){
        if($scope.editPacket == undefined){
            Materialize.toast('Select a valid packet ',2000);
        }
        var packet = {};
        packet.vehicleId = $scope.editPacket.deviceId;
        packet.deviceImei = $scope.editPacket.deviceImei;
        packet.packetId = $scope.editPacket.packetId;
        packet.speed = $scope.editPacket.speed.toString();
        packet.odometer = $scope.editPacket.odometer.toString();
        packet.latitude = $scope.editPacket.latitude.toString();
        packet.longitude = $scope.editPacket.longitude.toString();
        packet.packetTime = moment($scope.editPacket.packetTime,'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        if(packet.packetId == -1){
            SettingsService.createPacket(packet,function(status,reason){
                if(status == "SUCCESS"){
                    Materialize.toast('Packet created successfully',2000);
                    Materialize.toast('Refresh to see changes',2000);
                }else{
                    Materialize.toast('Error in updating packet, try again later.',2000);
                }
            });
        }else{
            SettingsService.updatePacket(packet,function(status,reason){
                if(status == "SUCCESS"){
                    Materialize.toast('Packet updated successfully',2000);
                    Materialize.toast('Refresh to see changes',2000);
                }else{
                    Materialize.toast('Error in updating packet, try again later.',2000);
                }
            });
        }
    }
    $scope.deletePacket = function(){
        if($scope.editPacket == undefined || $scope.editPacket.packetId == -1){
            Materialize.toast('Select a valid packet to delete ',2000);
        }else{
            SettingsService.deletePacket($scope.editPacket.packetId,function(status,reason){
                if(status == "SUCCESS"){
                    Materialize.toast('Packet deleted successfully',2000);
                    Materialize.toast('Refresh to see changes',2000);
                }else{
                    Materialize.toast('Error in deleting packet, try again later.',2000);
                }
            });
        }
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
