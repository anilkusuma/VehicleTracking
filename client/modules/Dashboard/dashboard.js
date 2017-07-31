app.factory('DashboardService',['$http','$rootScope',function($http,$rootScope){
    var DashboardServices = {};
    DashboardServices.getUserVehicles = function(userId,callback){
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
    DashboardServices.getVehicleLatestPacket = function(imei,callback){
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
    DashboardServices.getTodayOdometer = function(imei,callback){
        var url = '/api/DeviceGps/TodaysOdometer?imei='+imei;
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            callback(response.data.returnStatus,response.data.responseData.distanceCovered);
        },function errorCallback(response) {
            callback("ERROR");  
        });
    }
    return DashboardServices;
}]);


app.controller('dashboardCtr',['$rootScope','$scope','DashboardService','$timeout','$location',function($rootScope,$scope,DashboardService,$timeout,$location){
    $rootScope.AndroidText = 'Customers';
    showPreloader();
    $scope.img = new Image();
    $scope.img.src = "./images/Truck Top View ex 1X1 50 pix.png";
    //$scope.img.src = "./images/BikeTopView.png";
	var resetAllDashboardVariables = function(){
        $scope.dashboardVariable = {};
	    $scope.dashboardVariable.Map = "";
	    $scope.dashboardVariable.dashboard_markers = [];
	    $scope.dashboardVariable.dashboard_infobox = [];
	    $scope.dashboardVariable.markerClusterer = [];
	    $scope.dashboardVariable.bounds = "";
    };
    var init = function(){
        $scope.dashboardVariable = {};
        $scope.dashboardVariable.Map = "";
        $scope.dashboardVariable.bounds = new google.maps.LatLngBounds();
        $scope.dashboardVariable.dashboardMarkers = [];
        $scope.dashboardVariable.dashboardInfobox = [];
        $scope.dashboardVariable.markerClusterer = [];
        $scope.selectheader = true;
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#tracking').trigger("click.collapse");
            $('.live-li').addClass('active');
        },0,false);
        $timeout(function(){
            loadDashboardMap();
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
                refreshDashboard();
                $rootScope.initSelect();
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshDashboard();
            $rootScope.initSelect();
        }
    };
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshDashboard();
    };
    var refreshDashboard = function(){
        $timeout(function(){
            loadDashboardMap();
        },0,true);
        DashboardService.getUserVehicles($rootScope.currentCustomer.userId,function(status,vehicles){
            if(status == "SUCCESS"){
                $scope.vehicles = vehicles;
                for(var i=0;i< $scope.vehicles.length ; i++){
                    var dashboardTimer = {};
                    dashboardTimer.timerPromise = '';
                    dashboardTimer.vehicle = $scope.vehicles[i];
                    $rootScope.dashboardTimers.push(dashboardTimer);
                    $scope.vehicles[i].dashboardTimer = dashboardTimer;
                    $scope.vehicles[i].showFlag = true;
                    $scope.vehicles[i].epolyImage = '';
                    $scope.vehicles[i].vehicleMarker = '';
                    $scope.vehicles[i].latitude = '';
                    $scope.vehicles[i].longitude = '';
                    $scope.vehicles[i].speed = '';
                    $scope.vehicles[i].odometer = '';
                    $scope.vehicles[i].packetId = '';
                    $scope.vehicles[i].previousPacketTime = '';
                    $scope.vehicles[i].packetTime = '';
                    $scope.vehicles[i].oldPacket = '';
                    $scope.vehicles[i].lastPacket = '';
                    $scope.vehicles[i].currentPacket = '';
                    $scope.vehicles[i].vehicleLocation = '';
                    $scope.vehicles[i].vehicleMarker = "";
                    $scope.vehicles[i].epolyImage = "";
                    $scope.vehicles[i].deltaPoint= "";
                    getLocationDetails($scope.vehicles[i]);
                }
                hidePreloader({},function(){
                    $timeout(function(){
                        $('#dashboardtable-table').DataTable();
                        $rootScope.initSelect();
                        triggerMapResize();
                    },0,true);
                });
            }else if(status == "EMPTY"){
                Materialize.toast('Add a vehicle first',1000);
                $location.path('/vehicles');
            }else if(status == "FAILED" || status == "ERROR"){
                Materialize.toast('Session expired,login again',1000);
                $rootScope.logout();
            }
        });
    }
	var triggerMapResize = function(){
        google.maps.event.trigger($scope.dashboardVariable.Map, 'resize');
    };

    var loadDashboardMap = function(){
        var styles = [
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            }
        ];
        var styledMap = new google.maps.StyledMapType(styles, {
            name: "Styled Map"
        });
        var mapOptions= {
            center: new google.maps.LatLng(17.473075,78.482160),
            zoom:8,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
            },
            streetViewControl:false,
            scrollwheel: false,
            draggable: true,
            fullscreenControl:true
        };
        $scope.dashboardVariable.Map = new google.maps.Map(document.getElementById('DashboardMapContent'),mapOptions);
        $scope.dashboardVariable.Map.mapTypes.set('map_style', styledMap);
        $scope.dashboardVariable.Map.setMapTypeId('map_style');
    };
    var getLocationDetails = function(vehicle){
        DashboardService.getVehicleLatestPacket(vehicle.deviceImei,function(status,location){
            if(status == "SUCCESS"){
                if(moment(location[0].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss') != vehicle.packetTime || vehicle.packetTime == ""){
                    vehicle.latitude = location[0].latitude;
                    vehicle.longitude = location[0].longitude;
                    vehicle.speed = location[0].speed;
                    vehicle.odometer = location[0].odometer;
                    vehicle.packetId = location[0].packetId;
                    if(vehicle.packetTime != '')
                        vehicle.previousPacketTime = vehicle.packetTime;
                    else
                        vehicle.previousPacketTime = moment(location[0].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss');
                    vehicle.packetTime = moment(location[0].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss');
                    if(vehicle.currentPacket == '')
                        vehicle.oldPacket = location[0];
                    else
                        vehicle.oldPacket = vehicle.currentPacket;
                    if(location[1] == undefined)
                        vehicle.lastPacket = location[0];
                    else
                        vehicle.lastPacket = location[1];

                    vehicle.currentPacket = location[0];
                    if(vehicle.previousPacketTime != vehicle.packetTime || vehicle.vehicleLocation == ''){
                        var latLng = new google.maps.LatLng(vehicle.latitude,vehicle.longitude);
                        $rootScope.geoDecode(latLng,function(address){
                            $timeout(function(){
                                vehicle.vehicleLocation = address;
                            },0,true);
                        });
                        DashboardService.getTodayOdometer(vehicle.deviceImei,function(status,odometer){
                            if(status == "SUCCESS" || status == "EMPTY"){
                                vehicle.odometer = odometer;
                            }
                            populateMap(vehicle);
                        });
                    }
                }
            }else if(status == "FAILED"){
                Materialize.toast('Session expired,login again',1000);
                $rootScope.logout();
            }
            vehicle.dashboardTimer.timerPromise  =   $timeout(function(){
                                                        getLocationDetails(vehicle);
                                                    },2000,true);
        });
    };
    $scope.showFlagChange = function($index){
        if($scope.vehicles[$index].showFlag){
            if($scope.vehicles[$index].vehicleMarker !== ""){
                $scope.vehicles[$index].vehicleMarker.setMap($scope.dashboardVariable.Map);
                if($scope.vehicles[$index].epolyImage != null){
                    $scope.vehicles[$index].epolyImage.show();
                }
            }else{
                $scope.vehicles[$index].showFlag = true;
            }
        }else{
            if($scope.vehicles[$index].vehicleMarker !== ""){
                $scope.vehicles[$index].vehicleMarker.setMap(null);
                if($scope.vehicles[$index].epolyImage != null){
                    $scope.vehicles[$index].epolyImage.hide();
                }
            }else{
                $scope.vehicles[$index].showFlag = false;
            }
        }
    }
    $scope.selectHeaderChanged = function(){
        for(var i=0;i<$scope.vehicles.length;i++){
            $scope.vehicles[i].showFlag = $scope.selectheader;
        }
    }
    var populateMap = function(vehicle){
        var point = new google.maps.LatLng(vehicle.latitude,vehicle.longitude);
        if(vehicle.vehicleMarker == "" || vehicle.epolyImage == ""){
            vehicle.vehicleMarker = dashboardMapFunctions.getVehicleMarker(vehicle);
            vehicle.vehicleMarker.set("labelClass","number_labels "+"markerLabel"+vehicle.deviceId);
            vehicle.epolyImage = dashboardMapFunctions.getEpolyMarker(vehicle);
            vehicle.epolyImage.setId(vehicle);
            vehicle.infobox = dashboardMapFunctions.createInfoBox(vehicle);
            $scope.dashboardVariable.dashboardMarkers.push(vehicle.vehicleMarker);
            $scope.dashboardVariable.dashboardInfobox.push(vehicle.infobox);
            if(vehicle.showFlag == true){
                vehicle.vehicleMarker.setMap($scope.dashboardVariable.Map);
                if(vehicle.epolyImage != null){
                    vehicle.epolyImage.setMap($scope.dashboardVariable.Map);
                }
            }
            $scope.dashboardVariable.bounds.extend(vehicle.vehicleMarker.getPosition());
            $scope.dashboardVariable.Map.fitBounds($scope.dashboardVariable.bounds);
            updateInfoBox(vehicle);
            
        }
        else{
            if(vehicle.showFlag == true){
                //$scope.dashboardVariable.Map.setCenter(new google.maps.LatLng(vehicle.latitude,vehicle.longitude));
                dashboardTransistionFunction.animateToNewPosition(vehicle);
            }else{
                $scope.dashboardMapFunctions.drawEployMaker(vehicle);
                vehicle.epolyImage.setPoint(point);
                vehicle.vehicleMarker.setMap(null);
                vehicle.epolyImage.hide();
            }
            updateInfoBox(vehicle);
        }
    };
    var updateInfoBox = function(vehiclev){
        //"<div class='content'>Last Onlie : " + vehiclev.packetTime + "</div>" +
        var content = "<div class='content'>Vehicle Number : " + vehiclev.deviceName+ "</div>" + "<div class='content'>Speed : " + vehiclev.speed + " KMPH" + "</div>" + "<div class='content'>Distance travelled today : " + vehiclev.odometer  + " Km" + "</div>" ;
        vehiclev.infobox.setContent(content);
        vehiclev.infobox.setPosition(vehiclev.vehicleMarker.getPosition());
    };

    var updateLabelBoxColor = {
        updateColor : function(vehicle){
            var a = moment();
            var b = moment(vehicle.packetTime,'MMMM Do YYYY, HH:mm:ss');
            if(a.diff(b,'minutes')>30){
                $('.markerLabel'+vehicle.deviceId).css('background-color','red');
                $('.markerLabel'+vehicle.deviceId).css('color','white');
            }else if(vehicle.speed == 0){
                $('.markerLabel'+vehicle.deviceId).css('background-color','yellow');
                $('.markerLabel'+vehicle.deviceId).css('color','black');
            }
            else if(a.diff(b,'minutes') < 30){
                $('.markerLabel'+vehicle.deviceId).css('background-color','green');
                $('.markerLabel'+vehicle.deviceId).css('color','white');
            }
        }
    };

    var dashboardMapFunctions = {
        clearMarker : function(mark){
            mark.setMap(null);
        },
        drawEployMaker : function(vehicle){
            updateLabelBoxColor.updateColor(vehicle);
            canvas = document.getElementById('dashboardCanvas'+vehicle.deviceId);
            if(canvas!= null){
                canvas = canvas.getContext('2d');
                var p0 = new google.maps.LatLng(vehicle.lastPacket.latitude,vehicle.lastPacket.longitude);
                var p1 = new google.maps.LatLng(vehicle.currentPacket.latitude,vehicle.currentPacket.longitude);
                var angle = dashboardCanvasFunctions.getBearing(p0,p1);
                dashboardCanvasFunctions.plotImage(angle,canvas);
            }
        },
        getVehicleMarker : function(vehicle){
            var myLatLng = new google.maps.LatLng(vehicle.latitude,vehicle.longitude);
            var marker = new MarkerWithLabel({
                position: myLatLng,
                icon: " ",
                labelContent:vehicle.deviceName,
                labelAnchor: new google.maps.Point(22, 0),
                labelClass: "number_labels", // the CSS class for the label
                labelStyle: {opacity: 0.75}
            });
            return marker;
        },
        getEpolyMarker : function(vehicle){
            var myLatLng = new google.maps.LatLng(vehicle.latitude,vehicle.longitude);
            var epolyMarker = new ELabel({
                                    latlng: myLatLng, 
                                    label: '<canvas id="dashboardCanvas'+vehicle.deviceId+'" width="50" height="50"></canvas>', 
                                    classname: 'markerdcanvas', 
                                    offset: new google.maps.Size(-25,-25), 
                                    opacity: 100, 
                                    overlap: true,
                                    clicktarget: false,
                                    callbackTarget : dashboardMapFunctions.drawEployMaker
                                });
            return epolyMarker;
        },
        MarkerImage : {
            url:'./images/Truck Top View ex 1X1 50 pix.png',
            size: new google.maps.Size(50,50),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(25, 25),
            rotation: '180'
        },
        createInfoBox : function(vehicle){
            var location = new google.maps.LatLng(vehicle.latitude,vehicle.longitude);
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
            google.maps.event.addListener($scope.dashboardVariable.Map, 'click', function () {
                for(var i = 0 ; i < $scope.vehicles.length ; i++){
                    if($scope.vehicles[i].infobox !== ""){
                        $scope.vehicles[i].infobox.close();
                    }
                }
            });
            google.maps.event.addListener(vehicle.vehicleMarker, 'click', function () {
                for(var i = 0 ; i < $scope.vehicles.length ; i++){
                    if($scope.vehicles[i].infobox !== ""){
                        $scope.vehicles[i].infobox.close();
                    }
                }
                ib.open($scope.dashboardVariable.Map, vehicle.vehicleMarker);
            });
            return ib;
        }
    };
    var dashboardTransistionFunction = {
        animateToNewPosition : function(vehicle){
            vehicle.AT_startPosition_lat = vehicle.oldPacket.latitude;
            vehicle.AT_startPosition_lng = vehicle.oldPacket.longitude;
            vehicle.newPosition_lat = vehicle.latitude;
            vehicle.newPosition_lng = vehicle.longitude;
            if((vehicle.AT_startPosition_lat == vehicle.newPosition_lat) && (vehicle.AT_startPosition_lng - vehicle.newPosition_lng)){
                vehicle.vehicleMarker.setPosition(new google.maps.LatLng(vehicle.newPosition_lat,vehicle.newPosition_lng));
                if(vehicle.epolyImage != null){
                    dashboardMapFunctions.drawEployMaker(vehicle);
                    vehicle.epolyImage.setPoint(new google.maps.LatLng(vehicle.newPosition_lat,vehicle.newPosition_lng));
                }
                return;
            }else{
                dashboardTransistionFunction.animateStep(vehicle,(new Date()).getTime());
            }
        },
        animateStep : function(vehicle, startTime) {            
            var ellapsedTime = (new Date()).getTime() - startTime;
            var durationRatio = ellapsedTime/5000; // 0 - 1
            var easingDurationRatio = durationRatio;
            
            if (durationRatio < 1) {
                var deltaPosition = new google.maps.LatLng(parseFloat(vehicle.AT_startPosition_lat) + parseFloat(parseFloat(vehicle.newPosition_lat - vehicle.AT_startPosition_lat)*easingDurationRatio),
                                                              parseFloat(vehicle.AT_startPosition_lng) + parseFloat(parseFloat(vehicle.newPosition_lng - vehicle.AT_startPosition_lng)*easingDurationRatio));
                vehicle.vehicleMarker.setPosition(deltaPosition);
                if(vehicle.epolyImage != null){
                    dashboardTransistionFunction.drawTransistionEployMaker(vehicle,deltaPosition);
                    vehicle.epolyImage.setPoint(deltaPosition);
                }
                vehicle.AT_animationHandler =   $timeout(function(){
                                                    dashboardTransistionFunction.animateStep(vehicle, startTime)
                                                },0,false); 
            }else {
                vehicle.vehicleMarker.setPosition(new google.maps.LatLng(vehicle.newPosition_lat,vehicle.newPosition_lng));
                if(vehicle.epolyImage != null){
                    dashboardMapFunctions.drawEployMaker(vehicle);
                    vehicle.epolyImage.setPoint(new google.maps.LatLng(vehicle.newPosition_lat,vehicle.newPosition_lng));
                }
            }            
        },
        drawTransistionEployMaker : function(vehicle,newDelta){
            canvas = document.getElementById('dashboardCanvas'+vehicle.deviceId);
            if(canvas!= null){
                canvas = canvas.getContext('2d');
                if(vehicle.deltaPoint == "")
                    var p0 = newDelta;
                else
                    var p0 = vehicle.deltaPoint;
                var p1 = newDelta;
                var angle = dashboardCanvasFunctions.getBearing(p0,p1);
                dashboardCanvasFunctions.plotImage(angle,canvas);
            }
            vehicle.deltaPoint = newDelta;   
        },
    };

    var dashboardCanvasFunctions = {
        checkSupportsCanvas : function(){
            return true;
        },
        getBearing : function(from,to){
            var lat1 = from.latRadians();
            var lon1 = from.lngRadians();
            var lat2 = to.latRadians();
            var lon2 = to.lngRadians();
            var angle = - Math.atan2( Math.sin( lon1 - lon2 ) * Math.cos( lat2 ), Math.cos( lat1 ) * Math.sin( lat2 ) - Math.sin( lat1 ) * Math.cos( lat2 ) * Math.cos( lon1 - lon2 ) );
            if ( angle < 0.0 )
                angle  += Math.PI * 2.0;
            angle = angle+Math.PI;
            return angle;
        },
        plotImage : function(angle,canvas){
            var cosa = Math.cos(angle);
            var sina = Math.sin(angle);
            canvas.clearRect(0,0,50,50);
            canvas.save();
            canvas.rotate(angle);
            canvas.translate(25*sina+25*cosa,25*cosa-25*sina);
            canvas.drawImage($scope.img,-25,-25);
            canvas.restore();
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
