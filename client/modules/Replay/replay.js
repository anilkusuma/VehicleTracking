app.factory('ReplaySerive',['$http','$rootScope',function($http,$rootScope){
    var ReplaySerives = {};
    ReplaySerives.getUserVehicles = function(userId,callback){
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
    ReplaySerives.getVehicleLatestPacket = function(imei,callback){
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
    ReplaySerives.getVehicleHistory = function(imei,startTime,endTime,callback){
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
    return ReplaySerives;
}]);


app.controller('replayCtr',['$rootScope','$scope','ReplaySerive','$timeout','$location',function($rootScope,$scope,ReplaySerive,$timeout,$location){
    $rootScope.AndroidText = 'Replay';
    showPreloader();
    $scope.canvas = ""
    $scope.k = 0;
    $scope.i=0;
    $scope.el="";
    $scope.evt = new CustomEvent('speedchange');
    $scope.sd = "";
    $scope.ed = "";
    $scope.ac = "";
    $scope.busStoppedPosition = 0;
    $scope.startFlag = "";
    $scope.endFlag = "";

    $scope.pointerImage =  {
                            url:'./images/vehiclemap.png',
                            size: new google.maps.Size(50,50),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(25, 47)
                        };
    $scope.startPointer =  {
                            url:'./images/startflag.png',
                            size: new google.maps.Size(50,50),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(5, 47)
                        };
    $scope.endPointer =    {
                            url:'./images/endflag.png',
                            size: new google.maps.Size(50,50),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(5, 47)
                        };
    $scope.startFlag = new google.maps.Marker({
                                                icon : $scope.startPointer
                                            });
    $scope.endFlag = new google.maps.Marker({
                                                icon : $scope.endPointer
                                            });

    $scope.polyLine = new google.maps.Polyline({   strokeColor: '#15356e',
                                                strokeOpacity: 1.0,
                                                strokeWeight: 1
                                            });
    $scope.img = new Image();
    $scope.img.src = "./images/SchoolBus.png";

    $scope.showMapActions = false;
    $scope.showPlayButton = false;
    $scope.ReplayMap = "";
    $scope.startTime = "";
    $scope.endTIme = "";
    $scope.speedLine = [];
    $scope.path = [];
    $scope.tick = 100;
    $scope.stopageMarkers = [];
    $scope.infoBoxes = [];
    $scope.pointMarkers = [];
    $scope.busMarker = "";
    $scope.PolyLine = new google.maps.Polyline({   strokeColor: '#15356e',
                                                      strokeOpacity: 1.0,
                                                      strokeWeight: 1
                                                  });
    $scope.reset = true;

    $scope.el = document.querySelector('.odometer-reading');
    $scope.od = new Odometer({
        el: $scope.el,
        value: '000000',// Any option (other than auto and selector) can be passed in here
        format:'d',
        theme: 'car',
        duration: 10
    });
    $("#speedometer").myfunc({
        maxVal:220,// Max value of the meter
        divFact:10,// Division value of the meter
        dangerLevel:120,// more than this leval, color will be red
        initDeg:-20,// reading begins angle
        maxDeg:220,// total angle of the meter reading
        edgeRadius:150,// radius of the meter circle
        speedNobeH:4,// speed nobe height
        speedoNobeW:95,// speed nobe width
        speedoNobeL:13,// speed nobe left position
        indicatorRadius:135,// radius of indicators position
        indicatorNumbRadius:90,// radius of numbers position
        speedPositionTxtWH:80,// speedo-meter current value cont
        nobW:20,// indicator nob width
        nobH:4,// indicator nob height
        numbW:30,// indicator number width
        numbH:16,// indicator number height
        midNobW:10,// indicator mid nob width
        midNobH:3,// indicator mid nob height
        noOfSmallDiv:4,// no of small div between main div
        eventListenerType: 'speedchange',// no of small div between main div
    }); 

    var init = function(){
        $timeout(function(){
            $('li.active a.active').trigger('click.collapse');
            $('li.nav-li').removeClass('active');
            $('#tracking').trigger("click.collapse");
            $('.Replay-li').addClass('active');
        },0,false);
        $timeout(function(){
            loadEditMap();
        },0,true);
        if($rootScope.userDetails.userType == 'COMPANY'){
            $scope.customers = [{'vtsUsers':{'name':'None'},'userId':$rootScope.userDetails.userId,'companyId':$rootScope.userDetails.companyId}];
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
                refreshReplay();
            });
        }else if($rootScope.userDetails.userType == 'USER'){
            $scope.selectedCustomer = $rootScope.userDetails;
            $rootScope.currentCustomer = $scope.selectedCustomer;
            refreshReplay();
            $rootScope.initSelect();
        }
    };
    $scope.customerChanged = function(customer){
        $rootScope.currentCustomer = customer;
        refreshReplay();
    };
    var refreshReplay = function(){
        $timeout(function(){
            loadEditMap();
            clearReplayMap();
        },0,true);

        $scope.fromDate = new Date();
        $scope.toDate = new Date();
        ReplaySerive.getUserVehicles($rootScope.currentCustomer.userId,function(status,vehicles){
            if(status == "SUCCESS"){
                $scope.vehicles = vehicles;
                $scope.selectedVehicle = $scope.vehicles[0];
                $scope.vehicleChanged();
                hidePreloader({},function(){
                    $timeout(function(){
                        $rootScope.initSelect();
                        triggerMapResize();
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
    $scope.vehicleChanged = function(){
        var vehicle = $scope.selectedVehicle;
        $scope.AT_startPosition_lat = "";
        $scope.AT_startPosition_lng = "";
        $scope.newPosition_lat = "";
        $scope.newPosition_lng = "";
        $scope.currentPoint = "";
        $scope.nextPoint = "";
    }

    var loadEditMap = function(){
        var mapOptions ={   
                            center: new google.maps.LatLng(17.473075,78.482160),
                            zoom:15,
                            mapTypeControl:true,
                            streetViewControl:false,
                            scrollwheel: false,
                            draggable: true,
                            fullscreenControl:true
                        };
        $scope.ReplayMap = new google.maps.Map(document.getElementById('replayMap'),mapOptions);
    };
    var triggerMapResize = function(){
        google.maps.event.trigger($scope.ReplayMap,'resize');
    };

    $scope.minimize = function(){
        $(".readings-div").css('opacity','0');
        $(".minimize-button").css('opacity','0');
        $(".maximize-button").css('opacity','1');
    };
    $scope.maximize = function(){
        $(".readings-div").css('opacity','1');
        $(".minimize-button").css('opacity','1');
        $(".maximize-button").css('opacity','0');
    };
            
                


    
    var animateToNewPosition = function(currentPoint,nextPoint){
        $scope.AT_startPosition_lat = currentPoint.lat();
        $scope.AT_startPosition_lng = currentPoint.lng();
        $scope.newPosition_lat = nextPoint.lat();
        $scope.newPosition_lng = nextPoint.lng();
        $scope.d_lat = $scope.AT_startPosition_lat;
        $scope.d_lng = $scope.AT_startPosition_lng;
        $scope.currentPoint = currentPoint;
        $scope.nextPoint = nextPoint;
        if(($scope.newPosition_lat == $scope.AT_startPosition_lat) && ($scope.newPosition_lng == $scope.AT_startPosition_lng )){
            if($scope.busMarker != ""){
                $scope.busMarker.setPoint(nextPoint);
            }
            animate();
            return;
        }else{
            $scope.frameCount = 0;
            $scope.latDif = parseFloat(parseFloat($scope.newPosition_lat - $scope.AT_startPosition_lat)/(parseInt(24*($scope.tick/1000))));
            $scope.lngDif = parseFloat(parseFloat($scope.newPosition_lng  - $scope.AT_startPosition_lng)/(parseInt(24*($scope.tick/1000))));
            animateStep((new Date()).getTime());
        }
    };
    var animateStep = function(startTime) {
        if($scope.frameCount < parseFloat(24*($scope.tick/1000))-1){
            $scope.d_lat = parseFloat($scope.d_lat) + parseFloat($scope.latDif);
            $scope.d_lng = parseFloat($scope.d_lng) + parseFloat($scope.lngDif);
            var deltaPosition = new google.maps.LatLng(parseFloat($scope.d_lat),parseFloat($scope.d_lng));
            if($scope.busMarker != ""){
                $timeout(function(){
                   $scope.busMarker.setPoint(deltaPosition); 
                },0,true) 
            }
            $scope.frameCount = $scope.frameCount+1;
            $rootScope.ReplayTimeOutVariable = $timeout(function(){
                                                    animateStep(startTime)
                                                },$scope.tick,true);
        }else {
            if($scope.busMarker != ""){
                $scope.busMarker.setPoint($scope.nextPoint);
                $timeout(function(){
                    animate();
                },0,true);
            }
        }            
    }
    $scope.inputFocused = function(type){
        $('.errorName').hide();
    };
    $scope.submitReplay = function(){
        showPreloader();
        clearReplayMap();
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
            $scope.startTime = moment(startDate).format('YYYY-MM-DD HH:mm:SS');;
            $scope.endTime = moment(endDate).format('YYYY-MM-DD HH:mm:SS');;
            ReplaySerive.getVehicleHistory($scope.selectedVehicle.deviceImei,$scope.startTime,$scope.endTime,function(status,history){
                if(status == "SUCCESS"){
                    $scope.showMapActions = true;
                    $scope.showPlayButton = false;
                    $scope.submittedVehicle.history = history;
                    hidePreloader({},function(){
                        displayHistory();
                    });
                    $timeout(function(){
                        $('.tooltipped').tooltip({delay: 10});
                    },0,true);
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
    var displayHistory = function(){
        var path = [];
        var vehicle = $scope.submittedVehicle;
        var history = vehicle.history.instance;
        startEndFlags(vehicle);
        for (var i = 0; i < history.length;i++) {
            var currentLatLng = new google.maps.LatLng(history[i].latitude,history[i].longitude);
            path.push(currentLatLng);
        }
        path = path.reverse();
        $scope.path = path;
        $scope.submittedVehicle.history.instance = $scope.submittedVehicle.history.instance.reverse();
        $scope.busMarker =  new ELabel({
                                            latlng: $scope.path[0], 
                                            label: '<canvas id="carcanvas'+vehicle.deviceId+'" width="50" height="50"></canvas>', 
                                            classname: 'carcanvas', 
                                            offset: new google.maps.Size(-25,-25), 
                                            opacity: 100, 
                                            overlap: true,
                                            clicktarget: false,
                                            callbackTarget : drawEpolyMarker
                                        });
        $scope.busMarker.setId(vehicle);
        $scope.busMarker.setMap($scope.ReplayMap);
        $scope.polyLine.setMap($scope.ReplayMap);
    };
    var startEndFlags = function(vehicle){
        var history = vehicle.history.instance;
        $scope.ReplayMap.setCenter(new google.maps.LatLng(history[history.length-1].latitude,history[history.length-1].longitude));
        $scope.startFlag.setPosition(new google.maps.LatLng(history[history.length-1].latitude,history[history.length-1].longitude));
        $scope.endFlag.setPosition(new google.maps.LatLng(history[0].latitude,history[0].longitude));
        $scope.startFlag.setMap($scope.ReplayMap);
        $scope.endFlag.setMap($scope.ReplayMap);
    };
    var drawEpolyMarker = function(vehicle){
        if (checkSupportsCanvas()) {   
            $scope.canvas = document.getElementById("carcanvas"+vehicle.deviceId).getContext('2d');
            var p0 = $scope.path[0];
            var p1 = $scope.path[1];
            var angle = getBearing(p0,p1);
            plotImage(angle);
        }
        $scope.i = parseInt(0);
        animate();                               
    };
    var animate = function() {
        var vehicle = $scope.submittedVehicle;
        var history = vehicle.history.instance;
        if($scope.i == $scope.path.length || $scope.showPlayButton){
            console.log("Returning ");
            return -1;
        }else if($scope.i == 0){
            $scope.i=parseInt($scope.i)+parseInt(1);
            animate();
            return;
        }else {
            if(history[$scope.i].speed == 0){
                if(history[$scope.i-1].speed == 0){
                    $scope.busMarker.setPoint($scope.path[$scope.i]);
                    $scope.i=parseInt($scope.i)+parseInt(1);
                    animate();
                    return;
                }else if(history[$scope.i-1].speed > 0){
                    $scope.ac = 1;
                    $scope.sd = moment(history[$scope.i].packetTime,'ddd MMM DD YYYY HH:mm:ss');
                    $scope.busStoppedPosition = $scope.i;
                    var marker = new google.maps.Marker( {
                           icon     : {
                               url     : "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png",
                               size    : new google.maps.Size( 7, 7 ),
                               anchor  : new google.maps.Point( 4, 4 )
                           },
                           position : $scope.path[($scope.i)-1],
                           map      : $scope.ReplayMap
                    });
                    $scope.polyLine.getPath().push($scope.path[$scope.i-1]);
                    var ibv = createInfoBox(marker);
                    updateInfoBox(ibv,($scope.i-1),vehicle);
                    $scope.infoBoxes.push(ibv);
                    $scope.pointMarkers.push(marker);
                    var p0 = $scope.path[($scope.i)-1];
                    var p1 = $scope.path[($scope.i)]
                    var angle = getBearing(p0,p1);
                    plotImage(angle);

                    $scope.i=parseInt($scope.i)+parseInt(1);
                    updateOdometerAndSpeed($scope.i-1);
                    if ($scope.k++>=(9)) {
                        $scope.ReplayMap.panTo($scope.path[$scope.i-1]);
                        $scope.k=0;
                    }
                    animateToNewPosition(p0,p1);
                    return;
                }
            }else if(history[$scope.i].speed !== 0){
                if($scope.ac == 1){
                    var ed = moment(history[$scope.i].packetTime,'ddd MMM DD YYYY HH:mm:ss');
                    var diference = ed.diff($scope.sd,'minutes',false);                    
                    if(diference > 1) {
                        var marker = new google.maps.Marker( {
                               icon     : {
                                   url     : "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png",
                                   size    : new google.maps.Size( 7, 7 ),
                                   anchor  : new google.maps.Point( 4, 4 )
                               },
                               position : $scope.path[$scope.busStoppedPosition],
                               map      : $scope.ReplayMap
                        });
                        $scope.polyLine.getPath().push($scope.path[$scope.busStoppedPosition]);

                        var ibv = createInfoBox(marker);
                        updateInfoBox(ibv,$scope.busStoppedPosition,vehicle);
                        $scope.infoBoxes.push(ibv);
                        $scope.pointMarkers.push(marker);
                        var marker = new google.maps.Marker({
                            position: new google.maps.LatLng(history[$scope.busStoppedPosition].latitude,history[$scope.busStoppedPosition].longitude),
                            map: $scope.ReplayMap
                        });
                        $scope.stopageMarkers.push(marker);
                        var ibvs = createInfoBox(marker,vehicle);
                        var content = "Stopped at : " + moment(history[$scope.busStoppedPosition].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss') + "<br/>" + "Stopped for : " +diference+" Minutes<br/>";
                        ibvs.setContent(content);
                    }
                    $scope.ac = -1;
                }
                var marker = new google.maps.Marker({
                           icon     : {
                               url     : "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png",
                               size    : new google.maps.Size( 7, 7 ),
                               anchor  : new google.maps.Point( 4, 4 )
                           },
                           position : $scope.path[($scope.i)-1],
                           map      : $scope.ReplayMap
                });
                $scope.polyLine.getPath().push($scope.path[$scope.i-1]);
                var ibv = createInfoBox(marker);
                updateInfoBox(ibv,($scope.i)-1,vehicle);
                $scope.infoBoxes.push(ibv);
                $scope.pointMarkers.push(marker);
                var p0 = $scope.path[($scope.i)-1];
                var p1 = $scope.path[$scope.i]
                var angle = getBearing(p0,p1);
                plotImage(angle);

                $scope.i=parseInt($scope.i)+parseInt(1);
                updateOdometerAndSpeed($scope.i-1);
                if ($scope.k++>=(9)) {
                    $scope.ReplayMap.panTo($scope.path[$scope.i-1]);
                    $scope.k=0;
                }
                animateToNewPosition(p0,p1);
                return;
            }
        }
    };
    var drawPolyline = function(d) {
        var pastLatLng = $scope.speedLine;
         if(pastLatLng === ""){
            pastLatLng = currentLatLng;
        }
        var path =  [
                        pastLatLng,
                        currentLatLng
                    ];
        var speedLine  = new google.maps.Polyline({
            path: path,
            strokeColor: '#b30000',
            strokeWeight: 8,
            zIndex:100
        });
        speedLine.setMap($scope.ReplayMap);
        $scope.speedLine.push(speedLine);
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
            ib.open($scope.ReplayMap, markerv);
        });
        google.maps.event.addListener(markerv, 'mouseout', function () {
            ib.close();
        });
        return ib;
        
    };
    
    var updateInfoBox = function(ibv,i,vehicle){
        var content = "VehicleID : " + vehicle.deviceName+ "<br/>" + "Speed : " + vehicle.history.instance[i].speed + " KMPH" + "<br/>" + "Time Of Data : " + moment(vehicle.history.instance[i].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss') + "<br/>" + "Distance Covered  : " +vehicle.history.instance[i].odometer + "<br/>";
        ibv.setContent(content);
    }; 
    var updateOdometerAndSpeed = function(id){
        var vehicle = $scope.submittedVehicle;
        $scope.el.innerHTML = vehicle.history.instance[id].odometer;
        $("#speedometer").val(vehicle.history.instance[id].speed);
        document.getElementById('speedometer').dispatchEvent($scope.evt);
    };
    $scope.pause = function(){
        $timeout.cancel($rootScope.ReplayTimeOutVariable);
        $scope.showPlayButton = true;
    },
    $scope.play = function(){
        $scope.showPlayButton = false;
        animate();
    },
    $scope.increase = function(){
        if($scope.tick <= 20)
            $('.speedinc-a').addClass('disabled');
        else if($scope.tick > 20){
            $('.speedinc-a').removeClass('disabled');
            if($scope.tick > 30)
                $scope.tick = $scope.tick - 20;
        }
        if($scope.tick > 250)
            $('.speeddec-a').addClass('disabled');
        else if($scope.tick <= 250){
            $('.speeddec-a').removeClass('disabled');
        }
    };
    $scope.decrease = function(){
        if($scope.tick  > 250)
            $('.speeddec-a').addClass('disabled');
        else if($scope.tick  <= 250){
            $('.speeddec-a').removeClass('disabled');
            if($scope.tick  < 250)
                $scope.tick  = $scope.tick  + 20;
        }
        if($scope.tick  <= 20)
            $('.speedinc-a').addClass('disabled');
        else if($scope.tick  > 20){
            $('.speedinc-a').removeClass('disabled');
        }
    };


    var clearReplayMap = function(){
        if($scope.busMarker != "")
            $scope.busMarker.setMap(null);

        if($scope.startFlag != "")
            $scope.startFlag.setMap(null);

        if($scope.endFlag != "")
            $scope.endFlag.setMap(null);

        for(var i=0;i<$scope.speedLine.length;i++){
            if($scope.speedLine[i]!=undefined)
                $scope.speedLine[i].setMap(null);
        }

        for(var i=0;i<$scope.stopageMarkers.length;i++){
            if($scope.stopageMarkers[i]!= undefined)
                $scope.stopageMarkers[i].setMap(null);
        }
        for(var i=0;i<$scope.pointMarkers.length;i++){
            if($scope.pointMarkers[i]!= undefined)
                $scope.pointMarkers[i].setMap(null);
        }
        $scope.polyLine.setMap(null);
        $scope.polyLine.getPath().length = 0;
        $scope.el.innerHTML = '000000';
        $("#speedometer").val(0);
        document.getElementById('speedometer').dispatchEvent($scope.evt);
        $timeout.cancel($rootScope.ReplayTimeOutVariable);
        resetVariables();
    };

    var resetVariables=  function(){
        $scope.canvas = "";
        $scope.k = 0;
        $scope.i = parseInt(0);
        $scope.sd="";
        $scope.ed="";
        $scope.ac=-1;
        $scope.vehicleMarker = "";
        $scope.startTime = "";
        $scope.endTIme = "";
        $scope.speedLine = [];
        $scope.path = [];
        $scope.tick = 100;
        $scope.stopageMarkers = [];
        $scope.busStoppedPosition = 0;
        $scope.infoBoxes = [];
        $scope.pointMarkers = [];
        $scope.busMarker = "";
        $timeout.cancel($rootScope.ReplayTimeOutVariable);
        $rootScope.ReplayTimeOutVariable = '';
        $scope.reset = true;
        $scope.showMapActions = false;
        $scope.showPlayButton = false;
        $scope.polyLine = new google.maps.Polyline({
                                                strokeColor: '#15356e',
                                                strokeOpacity: 1.0,
                                                strokeWeight: 1
                                            });
    };


    var checkSupportsCanvas = function(){
        return true;
    };
    var getBearing = function(from,to){
        var lat1 = from.latRadians();
        var lon1 = from.lngRadians();
        var lat2 = to.latRadians();
        var lon2 = to.lngRadians();
        var angle = - Math.atan2( Math.sin( lon1 - lon2 ) * Math.cos( lat2 ), Math.cos( lat1 ) * Math.sin( lat2 ) - Math.sin( lat1 ) * Math.cos( lat2 ) * Math.cos( lon1 - lon2 ) );
        if ( angle < 0.0 )
            angle  += Math.PI * 2.0;
        angle = angle+Math.PI;
        return angle;
    };
    var plotImage = function(angle){
        var canvas = $scope.canvas;
        var cosa = Math.cos(angle);
        var sina = Math.sin(angle);
        canvas.clearRect(0,0,50,50);
        canvas.save();
        canvas.rotate(angle);
        canvas.translate(25*sina+25*cosa,25*cosa-25*sina);
        canvas.drawImage($scope.img,-25,-25);
        canvas.restore();
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
    