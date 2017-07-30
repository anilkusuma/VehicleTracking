app.factory('HistorySerive',['$http','$rootScope',function($http,$rootScope){
    var HistorySerives = {};
    HistorySerives.getUserVehicles = function(userId,callback){
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
    HistorySerives.getVehicleLatestPacket = function(imei,callback){
        var url = '/api/DeviceGps/LatestPackets?imei='+imei;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    HistorySerives.getVehicleHistory = function(imei,startTime,endTime,callback){
        var url = '/api/DeviceGps/GetReplay?imei='+imei+'&startTime='+startTime+'&endTime='+endTime;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    }; 
    HistorySerives.getTodayHistory = function(imei,callback){
        var url = '/api/DeviceGps/GetTodayPackets?imei='+imei;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    };
    return HistorySerives;
}]);

app.controller('historyCtr',['$rootScope','$scope','HistorySerive','$timeout','$location',function($rootScope,$scope,HistorySerive,$timeout,$location){
    $rootScope.AndroidText = 'History';
    showPreloader();
    $scope.HistoryMap = "";
    $scope.pointMarkers = [];
    $scope.speedMarkers = [];
    $scope.infoBoxes = [];
    $scope.bounds = "";
    $scope.lastPoint = "";
    $scope.normalPolyLine = [];
    $scope.overSpeedPolyLine = [];
    $scope.startIcon =  {
                            url:'./images/startflag.png',
                            size: new google.maps.Size(50,50),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(5, 47)
                        };
    $scope.endIcon =    {
                            url:'./images/endflag.png',
                            size: new google.maps.Size(50,50),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(5, 47)
                        };
    $scope.startPointer = new google.maps.Marker({
                                                    icon : $scope.StartIcon
                                                });
    $scope.endPointer   = new google.maps.Marker({
                                                    icon : $scope.endIcon
                                                });
    $scope.img = new Image();
    $scope.img.src = "./images/Truck Top View ex 1X1 50 pix.png";
    $scope.inputFocused = function(type){
        $('.errorName').hide();
    };
    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#tracking').trigger("click.collapse");
            $('.history-li').addClass('active');
        },0,false);
        $timeout(function(){
            loadMap();
        },0,true);
        if($rootScope.userDetails.userType == 'COMPANY'){
            $scope.customers = [{'vtsUsers':{'name':'None'},'userId':0}];
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
                refreshHistory();
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshHistory();
            $rootScope.initSelect();
        }
    };
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshHistory();
    };
    var refreshHistory = function(){
        $scope.fromDate = new Date();
        $scope.toDate = new Date();
        $timeout(function(){
            loadMap();
        },0,true);
        HistorySerive.getUserVehicles($rootScope.currentCustomer.userId,function(status,vehicles){
            if(status == "SUCCESS"){
                $scope.vehicles = vehicles;
                $scope.selectedVehicle = $scope.vehicles[0];
                hidePreloader({},function(){
                    $timeout(function(){
                        $rootScope.initSelect();
                        triggerMapResize();
                    },0,true);
                });
                $scope.vehicleChanged();
            }else if(status == "EMPTY"){
                Materialize.toast('No vehicles, add vehicles to watch replay',2000);
                $location.path('/vehicles');
            }else if(status == "FAILED" || status == "ERROR"){
                Materialize.toast('Session expired,login again',1000);
                $rootScope.logout();
            }
        });
    };
    $scope.vehicleChanged = function(){
        loadTodayHistory();
    }
    var loadTodayHistory = function(){
        showPreloader();
        HistorySerive.getTodayHistory($scope.selectedVehicle.deviceImei,function(status,history){
            if(status == "SUCCESS"){
                $scope.submittedVehicle.history = history;
                var startLatLng = new google.maps.LatLng($scope.submittedVehicle.history.startLocation.substring(0,$scope.submittedVehicle.history.startLocation.indexOf(",")),$scope.submittedVehicle.history.startLocation.substring($scope.submittedVehicle.history.startLocation.indexOf(",")+1,$scope.submittedVehicle.history.startLocation.length));
                var endLatLng = new google.maps.LatLng($scope.submittedVehicle.history.endLocation.substring(0,$scope.submittedVehicle.history.endLocation.indexOf(",")),$scope.submittedVehicle.history.endLocation.substring($scope.submittedVehicle.history.endLocation.indexOf(",")+1,$scope.submittedVehicle.history.endLocation.length));
                $rootScope.geoDecode(startLatLng,function(address){
                    $timeout(function(){
                        $scope.submittedVehicle.history.startLocation = address;
                    },0,true);
                });
                $rootScope.geoDecode(endLatLng,function(address){
                    $timeout(function(){
                        $scope.submittedVehicle.history.endLocation = address;
                    },0,true);
                });
                displayHistory($scope.selectedVehicle);
            }else if(status == "ERROR"){
                Materialize.toast('Error in fetching details, try later',1000);
                hidePreloader();
            }else if(status == "EMPTY"){
                var html = 'No data available in selected dates.';
                $('#FromDate-error,.errorNameFromDate,#ToDate-error,.errorNameToDate').addClass('error');
                $('#FromDate-error,#ToDate-error').text(html);
                $('.errorNameFromDate,.errorNameToDate').show();
                hidePreloader();
            }else if(status == "FAILED"){
                Materialize.toast('Session expired');
                $rootScope.logout();
            }
        });
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
        $scope.HistoryMap = new google.maps.Map(document.getElementById('HistoryMap'),mapOptions);
    };
    var triggerMapResize = function(){
        google.maps.event.trigger($scope.HistoryMap,'resize');
    };

    $scope.submitHistory = function(){
        showPreloader();
        clearMap();
        $scope.submittedVehicle = $scope.selectedVehicle;
        var startDate = $scope.fromDate;
        var endDate = $scope.toDate;
        var valid = true;
        if(startDate == "" || startDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#FromDate-error,.errorNameFromDate').addClass('error');
            $('#FromDate-error').text(html);
            $('.errorNameFromDate').show();
            validated = false;
        }
        if(endDate == "" || endDate == undefined){
            var html = 'Please select a valid date and time.';
            $('#ToDate-error,.errorNameToDate').addClass('error');
            $('#ToDate-error').text(html);
            $('.errorNameToDate').show();
            validated = false;
        }
        if(moment(startDate).isAfter(moment(endDate))){
            var html = 'Please select time after start time.';
            $('#ToDate-error,.errorNameToDate').addClass('error');
            $('#ToDate-error').text(html);
            $('.errorNameToDate').show();
            validated = false;
        }
        if(valid){
            showPreloader();
            $scope.startTime = moment(startDate).format('YYYY-MM-DD HH:mm:SS');
            $scope.endTime = moment(endDate).format('YYYY-MM-DD HH:mm:SS');
            HistorySerive.getVehicleHistory($scope.selectedVehicle.deviceImei,$scope.startTime,$scope.endTime,function(status,history){
                if(status == "SUCCESS"){
                    $scope.submittedVehicle.history = history;
                    var startLatLng = new google.maps.LatLng($scope.submittedVehicle.history.startLocation.substring(0,$scope.submittedVehicle.history.startLocation.indexOf(",")),$scope.submittedVehicle.history.startLocation.substring($scope.submittedVehicle.history.startLocation.indexOf(",")+1,$scope.submittedVehicle.history.startLocation.length));
                    var endLatLng = new google.maps.LatLng($scope.submittedVehicle.history.endLocation.substring(0,$scope.submittedVehicle.history.endLocation.indexOf(",")),$scope.submittedVehicle.history.endLocation.substring($scope.submittedVehicle.history.endLocation.indexOf(",")+1,$scope.submittedVehicle.history.endLocation.length));
                    $rootScope.geoDecode(startLatLng,function(address){
                        $timeout(function(){
                            $scope.submittedVehicle.history.startLocation = address;
                        },0,true);
                    });
                    $rootScope.geoDecode(endLatLng,function(address){
                        $timeout(function(){
                            $scope.submittedVehicle.history.endLocation = address;
                        },0,true);
                    });
                    displayHistory($scope.selectedVehicle);
                }else if(status == "ERROR"){
                    Materialize.toast('Error in fetching details, try later',1000);
                    hidePreloader();
                }else if(status == "EMPTY"){
                    var html = 'No data available in selected dates.';
                    $('#FromDate-error,.errorNameFromDate,#ToDate-error,.errorNameToDate').addClass('error');
                    $('#FromDate-error,#ToDate-error').text(html);
                    $('.errorNameFromDate,.errorNameToDate').show();
                    hidePreloader();
                }else if(status == "FAILED"){
                    Materialize.toast('Session expired');
                    $rootScope.logout();
                }
            });
        }
    };
    var displayHistory = function(vehicle){
        var history = vehicle.history.instance;
        for(var i=0;i<history.length;i++){
            var point = new google.maps.LatLng(history[i].latitude,history[i].longitude);
            if(parseInt(history[i].speed) > parseInt(40)){
                if($scope.lastPoint == ""){
                    $scope.lastPoint = point;
                }
                var overSpeedPolyLine = new google.maps.Polyline({
                                                        strokeColor: '#b30000',
                                                        strokeWeight: 6,
                                                        path : [$scope.lastPoint,point],
                                                        zIndex:100
                                                    });
                $scope.overSpeedPolyLine.push(overSpeedPolyLine);
            }else if(parseInt(history[i].speed) <= parseInt(40)){
                if($scope.lastPoint == ""){
                    $scope.lastPoint = point;
                }
                var normalPolyLine =  new google.maps.Polyline({
                                                            strokeColor: '#00B3FD',
                                                            strokeWeight: 5,
                                                            path:[$scope.lastPoint,point],
                                                            zIndex : 99
                                                    });
                $scope.normalPolyLine.push(normalPolyLine);
            }
            if(i==0){
                $scope.endPointer.setPosition(point);
                var infoBox = createInfoBox($scope.endPointer);
                updateEndInfoBox(infoBox,i,vehicle);
                $scope.infoBoxes.push(infoBox);
            }else if(i== (history.length-1)){
                $scope.startPointer.setPosition(point);
                var infoBox = createInfoBox($scope.startPointer);
                updateStartInfoBox(infoBox,i,vehicle);
                $scope.infoBoxes.push(infoBox);
            }else{
                var pointMarker = new google.maps.Marker({
                                        icon     : {
                                            // use whatever icon you want for the "dots"
                                            url     : "./images/TransparentPixel.png",
                                            size    : new google.maps.Size(10,10),
                                            anchor  : new google.maps.Point(5,5),
                                            origin  : new google.maps.Point(0,0)
                                        },
                                        position : point
                                    });
                $scope.pointMarkers.push(pointMarker);
                var infoBox = createInfoBox(pointMarker);
                updateInfoBox(infoBox,i,vehicle);
                $scope.infoBoxes.push(infoBox);
            }
            $scope.lastPoint = point;
        }
        
        hidePreloader({},function(){
            setVariableToMap();
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
                opacity: 0.9
              , width: "350px"
              ,padding : "10px"
              ,border: "1px solid black"
            }
            , closeBoxMargin: "10px 5px 0px 2px"
            , closeBoxURL: ""
            , infoBoxClearance: new google.maps.Size(1, 1)
            , isHidden: false
            , pane: "floatPane"
            , enableEventPropagation: false
        };
        var ib = new InfoBox(myOptions);
        google.maps.event.addListener(markerv, 'mouseover', function () {
            ib.open($scope.HistoryMap, markerv);
        });
        google.maps.event.addListener(markerv, 'mouseout', function () {
            ib.close();
        });
        return ib;
    };
    
    var updateInfoBox = function(ibv,i,vehicle){
        var content = "Vehicle Number : " +vehicle.deviceName+ "<br/>" + "Speed : " + vehicle.history.instance[i].speed + " KMPH" + "<br/>" + "Time Of Data : " + moment(vehicle.history.instance[i].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss') + "<br/>" + "Distance Covered  : " +vehicle.history.instance[i].odometer + "<br/>";
        ibv.setContent(content);
    };
    var updateStartInfoBox = function(ibv,i,vehicle){
        var content = "Vehicle trip started at this position in the time selected <br/>"+"Vehicle Number : " +vehicle.deviceName+ "<br/>" + "Speed : " + vehicle.history.instance[i].speed + " KMPH" + "<br/>" + "Time Of Data : " + moment(vehicle.history.instance[i].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss') + "<br/>" + "Distance Covered  : " +vehicle.history.instance[i].odometer + "<br/>";
        ibv.setContent(content);
    };
    var updateEndInfoBox = function(ibv,i,vehicle){
        var content = "Vehicle trip ended at this position in the time selected</br>"+"Vehicle Number : " + vehicle.deviceName+ "<br/>" + "Speed : " + vehicle.history.instance[i].speed + " KMPH" + "<br/>" + "Time Of Data : " + moment(vehicle.history.instance[i].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss') + "<br/>" + "Distance Covered  : " +vehicle.history.instance[i].odometer+ "<br/>";
        ibv.setContent(content);
    };
    var setVariableToMap = function(){
        if($scope.startPointer != "")
            $scope.startPointer.setMap($scope.HistoryMap);

        if($scope.endPointer != "")
            $scope.endPointer.setMap($scope.HistoryMap);

        for(var i=0;i<$scope.overSpeedPolyLine.length;i++){
            if($scope.overSpeedPolyLine[i] != undefined)
                $scope.overSpeedPolyLine[i].setMap($scope.HistoryMap);
        }

        for(var i=0;i<$scope.normalPolyLine.length;i++){
            if($scope.normalPolyLine[i] != undefined)
                $scope.normalPolyLine[i].setMap($scope.HistoryMap);
        }

        for(var i=0;i<$scope.pointMarkers.length;i++){
            if($scope.pointMarkers[i]!=undefined){
                $scope.pointMarkers[i].setMap($scope.HistoryMap);
            }   
        }
        $timeout(function(){
            var latlngbounds = new google.maps.LatLngBounds();
            for (var i = 0; i < $scope.pointMarkers.length; i++) {
                latlngbounds.extend($scope.pointMarkers[i].getPosition());
                $scope.HistoryMap.fitBounds(latlngbounds);
            }
        },0,true); 
    };

    var clearMap = function(){
        if($scope.startPointer != "")
            $scope.startPointer.setMap(null);

        if($scope.endPointer != "")
            $scope.endPointer.setMap(null);

        for(var i=0;i<$scope.overSpeedPolyLine.length;i++){
            if($scope.overSpeedPolyLine[i] != undefined)
                $scope.overSpeedPolyLine[i].setMap(null);
        }
        for(var i=0;i<$scope.normalPolyLine.length;i++){
            if($scope.normalPolyLine[i] != undefined)
                $scope.normalPolyLine[i].setMap(null);
        }
        for(var i=0;i<$scope.pointMarkers.length;i++){
            if($scope.pointMarkers[i] != undefined)
                $scope.pointMarkers[i].setMap(null);
        }
        resetVariables();
    };

    var resetVariables=  function(){
        $scope.pointMarkers = [];
        $scope.overSpeedPolyLine = [];
        $scope.normalPolyLine = [];
        $scope.speedMarkers = [];
        $scope.infoBoxes = [];
        $scope.lastPoint = "";
        $scope.bounds = "";
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