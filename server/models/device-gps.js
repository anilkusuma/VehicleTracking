module.exports = function(DeviceGps) {
	var customLib = require('../../server/customlib.js');
    var app = require('../../server/server.js');
    var moment = require('moment');  
    var bodyParser = require('body-parser').urlencoded({extended: true});
    DeviceGps.lastTwoPacketsOfVehicles = function(req,res,next){
        var result = {};
		customLib.validateCookies(req,function(status,user){
            var todayEnd = moment().format('YYYY-MM-DD HH:mm:ss');
			if(status){
				DeviceGps.find({where:{'and':[{'deviceImei':req.query.imei},{'packetTime':{lte:todayEnd}}]},order:'packetTime DESC',limit:2},function(err,instance){
					if(err){
                        result = {};
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else if(instance.length!=0){
						result.responseData = instance;
						result.returnStatus = "SUCCESS";
						res.send(result);
					}else{
						result = {};
						result.returnStatus = "EMPTY";
						res.send(result);
					}
				});
			}
			else{
				result = {};
				result.returnStatus = "FAILED";
				res.send(result);
			}
        });
    };
    DeviceGps.remoteMethod(
        'lastTwoPacketsOfVehicles',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/LatestPackets',verb:'get'}
        }
    );   
    DeviceGps.replayPackets = function(req,res,next){
        var result = {};
        result.responseData = {};
        var start_time = null;
		var end_time = null;
		var startLocation = null;
		var endLocation = null;
        var averageSpeed = null;
        var maximumSpeed = null;
        var numberOfStops = null;
        var distanceCovered = null;
        var todayEnd = moment().format('YYYY-MM-DD HH:mm:ss');
		customLib.validateCookies(req,function(status,user){
			if(status){
				DeviceGps.find({where:{and:[{'deviceImei':req.query.imei},{'packetTime':{gte:req.query.startTime}},{'packetTime':{lte:todayEnd}},{'packetTime':{lte:req.query.endTime}}]},order:'packetTime DESC'},function(err,instance){
					if(err){
						result = {};
						result.returnStatus = "ERROR";
						res.send(result);
					}else if(instance.length>1){
                        var max = 0;
                        var sum = 0;
                        var count=0;
						result.responseData.instance = instance;
                        if(start_time == null){
                            start_time = moment(instance[instance.length-1].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss');
                        }
                        if(end_time == null){
                            end_time = moment(instance[0].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss');
                        }
                        if(startLocation == null){
                            if(instance[instance.length-1].formattedAddress != null){
                                startLocation = instance[instance.length-1].formattedAddress;
                            }
                            else{
                                startLocation = instance[instance.length-1].latitude+","+instance[instance.length-1].longitude;
                            }
                        }
                        if(endLocation == null){
                            if(instance[0].formattedAddress!= null){
                                endLocation = instance[0].formattedAddress;
                            }
                            else{
                                endLocation = instance[0].latitude+","+instance[0].longitude;
                            }
                        }
                        if(distanceCovered == null){
                            distanceCovered = instance[0].odometer-instance[instance.length-1].odometer ;
                        }
                        for(var i=0;i<instance.length;i++){
                            if(parseInt(instance[i].speed)>parseInt(max)){
                                max= instance[i].speed;
                            }
                            sum = parseInt(instance[i].speed)+parseInt(sum);
                            if(parseInt(instance[i].speed) ==0){
                                count= count+1;
                            }
                        }
                        maximumSpeed = max;
                        averageSpeed = parseInt(sum)/parseInt(instance.length);
                        numberOfStops = count;
                        distanceCovered = Math.round(distanceCovered*100)/100;
                        averageSpeed = Math.round(averageSpeed*100)/100;
                            
                        result.responseData.deviceId = req.query.deviceId;
                        result.responseData.deviceImei = req.query.imei;
                        result.responseData.startLocation = startLocation;
                        result.responseData.endLocation = endLocation;
                        result.responseData.distanceCovered = distanceCovered;
                        result.responseData.maximumSpeed = maximumSpeed;
                        result.responseData.averageSpeed = averageSpeed;
                        result.responseData.numberOfStops = numberOfStops;
						result.responseData.startTime = start_time;
						result.responseData.endTime = end_time;
						result.returnStatus = "SUCCESS";
						res.send(result);
					}else{
						result.returnStatus = "EMPTY";
						res.send(result);
					}
				});
			}
			else{
				result = {};
				result.returnStatus = "FAILED";
				res.send(result);
			}
        });
    };
    DeviceGps.remoteMethod(
        'replayPackets',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/GetReplay',verb:'get'}
        }
    );  

    DeviceGps.getTodayPackets = function(req,res,next){
        var result = {};
        var start_time = null;
        var end_time = null;
        var startLocation = null;
        var endLocation = null;
        var averageSpeed = null;
        var maximumSpeed = null;
        var numberOfStops = null;
        var distanceCovered = null;
        customLib.validateCookies(req,function(status,user){
            var today = moment().format('YYYY-MM-DD');
            var todayStart = today+'00:00:00';
            var todayEnd = moment().format('YYYY-MM-DD HH:mm:ss');
            if(status){
                DeviceGps.find({where:{and:[{'deviceImei':req.query.imei},{'packetTime':{gte:todayStart}},{'packetTime':{lte:todayEnd}}]},order:'packetTime DESC'},function(err,instance){
                    if(err){
                        result = {};
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else if(instance.length>1){
                        var max = 0;
                        var sum = 0;
                        var count=0;
                        result.responseData.instance = instance;
                        if(start_time == null){
                            start_time = moment(instance[instance.length-1].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss');
                        }
                        if(end_time == null){
                            end_time = moment(instance[0].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss');
                        }
                        if(startLocation == null){
                            if(instance[instance.length-1].formattedAddress != null){
                                startLocation = instance[instance.length-1].formattedAddress;
                            }
                            else{
                                startLocation = instance[instance.length-1].latitude+","+instance[instance.length-1].longitude;
                            }
                        }
                        if(endLocation == null){
                            if(instance[0].formattedAddress!= null){
                                endLocation = instance[0].formattedAddress;
                            }
                            else{
                                endLocation = instance[0].latitude+","+instance[0].longitude;
                            }
                        }
                        if(distanceCovered == null){
                            distanceCovered = instance[0].odometer-instance[instance.length-1].odometer ;
                        }
                        for(var i=0;i<instance.length;i++){
                            if(parseInt(instance[i].speed)>parseInt(max)){
                                max= instance[i].speed;
                            }
                            sum = parseInt(instance[i].speed)+parseInt(sum);
                            if(parseInt(instance[i].speed) ==0){
                                count= count+1;
                            }
                        }
                        maximumSpeed = max;
                        averageSpeed = parseInt(sum)/parseInt(instance.length);
                        numberOfStops = count;
                        distanceCovered = Math.round(distanceCovered*100)/100;
                        averageSpeed = Math.round(averageSpeed*100)/100;
                            
                        result.responseData.deviceId = req.query.deviceId;
                        result.responseData.deviceImei = req.query.imei;
                        result.responseData.startLocation = startLocation;
                        result.responseData.endLocation = endLocation;
                        result.responseData.distanceCovered = distanceCovered;
                        result.responseData.maximumSpeed = maximumSpeed;
                        result.responseData.averageSpeed = averageSpeed;
                        result.responseData.numberOfStops = numberOfStops;
                        result.responseData.startTime = start_time;
                        result.responseData.endTime = end_time;
                        result.returnStatus = "SUCCESS";
                        res.send(result);
                    }else{
                        result.returnStatus = "EMPTY";
                        res.send(result);
                    }
                });
            }
            else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
            }
        });
    };
    DeviceGps.remoteMethod(
        'getTodayPackets',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/GetTodayPackets',verb:'get'}
        }
    );
    DeviceGps.getTodaysOdometer = function(req,res,next){
        var result = {};
        customLib.validateCookies(req,function(status,user){
            var today = moment().format('YYYY-MM-DD');
            var todayStart = today+'00:00:00';
            var todayEnd = moment().format('YYYY-MM-DD HH:mm:ss');
            if(status){
                DeviceGps.find({where:{and:[{'deviceImei':req.query.imei},{'packetTime':{gte:todayStart}},{'packetTime':{lte:todayEnd}}]},order:'packetTime DESC'},function(err,instance){
                    if(err){
                        result = {};
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else if(instance.length > 1){
                        distanceCovered = Math.round(distanceCovered*100)/100;
                        result.responseData = {};
                        result.responseData.distanceCovered = distanceCovered;
                        result.returnStatus = "SUCCESS";
                        res.send(result);
                    }else{
                        result.responseData = {};
                        result.responseData.distanceCovered = 0;
                        result.returnStatus = "EMPTY";
                        res.send(result);
                    }
                });
            }
            else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
            }
        });
    };
    DeviceGps.remoteMethod(
        'getTodaysOdometer',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/TodaysOdometer',verb:'get'}
        }
    );
    DeviceGps.detailedDayReport = function(req,res,next){
        var result = {};
        customLib.validateCookies(req,function(status,user){
            var selDate = moment(req.query.selDate,'YYYY-MM-DD').format('YYYY-MM-DD');
            var selStartDate = selDate+' 00:00:00';
            var selEndDate = selDate+' 23:59:59';
            var todayEnd = moment().format('YYYY-MM-DD HH:mm:ss');
            if(status){
                DeviceGps.find({where:{and:[{'deviceImei':req.query.imei},{'packetTime':{gte:selStartDate}},{'packetTime':{lte:todayEnd}},{'packetTime':{lte:selEndDate}}]},order:'packetTime DESC'},function(err,instance){
                    if(err){
                        result = {};
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else if(instance.length!=0){
                        result ={};
                        result.responseData = instance;
                        result.returnStatus = "SUCCESS";
                        res.send(result);
                    }else{
                        result = {};
                        result.returnStatus = "EMPTY";
                        res.send(result);
                    }
                });
            }
            else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
            }
        });
    };
    DeviceGps.remoteMethod(
        'detailedDayReport',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/DetailedReport',verb:'get'}
        }
    );
    DeviceGps.overSpeedReport = function(req,res,next){
        var result = {};
        customLib.validateCookies(req,function(status,user){
            var startTime = moment(req.query.startTime,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var endTime = moment(req.query.endTime,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var speed = parseInt(req.query.minSpeed);
            var todayEnd = moment().format('YYYY-MM-DD HH:mm:ss');
            if(status){
                DeviceGps.find({where:{and:[{'deviceImei':req.query.imei},{'packetTime':{gte:startTime}},{'packetTime':{lte:todayEnd}},{'packetTime':{lte:endTime}}]},order:'packetTime DESC'},function(err,instance){
                    if(err){
                        result = {};
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else if(instance.length!=0){
                        result = {};
                        result.responseData = instance;
                        result.returnStatus = "SUCCESS";
                        res.send(result);
                    }else{
                        result = {};
                        result.returnStatus = "EMPTY";
                        res.send(result);
                    }
                });
            }
            else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
            }
        });
    };
    DeviceGps.remoteMethod(
        'overSpeedReport',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/SpeedReport',verb:'get'}
        }
    );


    DeviceGps.stoppageReport = function(req,res,next){
        var result = {};
        customLib.validateCookies(req,function(status,user){
            var startTime = moment(req.query.startTime,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var endTime = moment(req.query.endTime,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var speed = parseInt(req.query.minStoppageTime);
            var todayEnd = moment().format('YYYY-MM-DD HH:mm:ss');
            if(status){
                DeviceGps.find({where:{and:[{'deviceImei':req.query.imei},{'packetTime':{gte:startTime}},{'packetTime':{lte:todayEnd}},{'packetTime':{lte:endTime}}]},order:'packetTime ASC'},function(err,instance){
                    if(err){
                        result = {};
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else if(instance.length!=0){
                        result = {};
                        var responseData = [];
                        var sp = {};
                        var ac = -1;
                        var sd = moment();
                        var ed = moment();
                        var diference = 0;
                        var packets = instance;
                        for(var i=1;i<packets.length;i++){
                            if(packets[i].speed == 0){
                                if(packets[i-1].speed == 0){
                                    continue;
                                }else if(packets[i-1].speed > 0){
                                    ac = 1;
                                    sd = moment(packets[i].packetTime,'ddd MMM DD YYYY HH:mm:ss');
                                    sp.packetId = packets[i].packetId;

                                    if(packets[i].formattedAddress == null)
                                        sp.stoppedLocation = packets[i].latitude+','+packets[i].longitude;
                                    else
                                        sp.stoppedLocation = packets[i].formattedAddress;

                                    sp.stoppedTime = packets[i].packetTime;
                                    sp.stoppedOdometer = packets[i].odometer;
                                    sp.startLat = packets[i].latitude;
                                    sp.startLng = packets[i].longitude;
                                    continue;
                                }
                            }else if(packets[i].speed != 0){
                                if(ac == 1){
                                    ed = moment(packets[i].packetTime,'ddd MMM DD YYYY HH:mm:ss');
                                    diference = ed.diff(sd,'minutes',false);    
                                    if(diference > speed) {
                                        sp.stoppedFor = diference+' minutes';
                                        sp.startTime = packets[i].packetTime;
                                        sp.stopLat = packets[i].latitude;
                                        sp.stopLng = packets[i].longitude;
                                        responseData.push(sp);
                                    }
                                    sp = {};
                                    ac = -1;
                                }
                            }
                        }
                        result.responseData = responseData;
                        result.returnStatus = "SUCCESS";
                        res.send(result);
                    }else{
                        result = {};
                        result.returnStatus = "EMPTY";
                        res.send(result);
                    }
                });
            }
            else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
            }
        });
    };
    DeviceGps.remoteMethod(
        'stoppageReport',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/StoppageReport',verb:'get'}
        }
    );

    DeviceGps.fenceReport = function(req,res,next){
        var result = {};
        customLib.validateCookies(req,function(status,user){
            if(status){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY")
                    var userId = req.body.userId;
                else if(userType == "USER")
                    var userId = user.userId;

                var userLoginName = user.vtsLogin.userName;
                var companyId = user.vtsLogin.companyId;

                var object = {};
                object.vehicles = req.body.vehicles;
                object.fences = req.body.fences;
                object.startTime = moment(req.body.startTime,'YYYY-MM-DD HH:mm:SS').format('YYYY-MM-DD HH:mm:SS');
                object.endTime = moment(req.body.endTime,'YYYY-MM-DD HH:mm:SS').format('YYYY-MM-DD HH:mm:SS');
                object.timeInterval = parseInt(req.body.timeInterval);

                if(object.vehicles.length != 0){
                    if(object.vehicles[0].deviceId == -1){
                        app.models.VtsDevices.find({'where':{'and':[{'userId':userId},{'companyId':companyId}]}},function(err,instance){
                            if(err){
                                result={};
                                result.returnStatus = "ERROR";
                                res.send(result);
                                return;
                            }else if(instance.length == 0){
                                result={};
                                result.returnStatus = "EMPTY";
                                res.send(result);
                                return;
                            }else{
                                object.vehicles = instance;
                                if(object.fences.length!=0){
                                    if(object.fences[0].geoFenceId == -1){
                                        app.models.VtsGeoFencing.find({'where':{'and':[{'userId':userId},{'companyId':companyId}]}},function(err,instance){
                                            if(err){
                                                result={};
                                                result.returnStatus = "ERROR";
                                                res.send(result);
                                                return;
                                            }else if(instance.length == 0){
                                                result={};
                                                result.returnStatus = "EMPTY";
                                                res.send(result);
                                                return;
                                            }else{
                                                object.fences = instance;
                                                DeviceGps.processVehicleAndFence(object.vehicles,object.fences,object.startTime,object.endTime,object.timeInterval,userId,companyId,function(result){
                                                    res.send(result);
                                                    return;
                                                });
                                            }
                                        });
                                    }else{
                                        DeviceGps.processVehicleAndFence(object.vehicles,object.fences,object.startTime,object.endTime,object.timeInterval,userId,companyId,function(result){
                                            res.send(result);
                                            return;
                                        });
                                    }
                                }else{
                                    result={};
                                    result.returnStatus = "EMPTY";
                                    res.send(result);
                                    return;
                                }
                            }
                        });
                    }else{
                        if(object.fences.length!=0){
                            if(object.fences[0].geoFenceId == -1){
                                app.models.VtsGeoFencing.find({'where':{'and':[{'userId':userId},{'companyId':companyId}]}},function(err,instance){console.log('geoFenc error and instance '+err+' '+JSON.stringify(instance));
                                    if(err){
                                        result={};
                                        result.returnStatus = "ERROR";
                                        res.send(result);
                                        return;
                                    }else if(instance.length == 0){
                                        result={};
                                        result.returnStatus = "EMPTY";
                                        res.send(result);
                                        return;
                                    }else{
                                        object.fences = instance;
                                        DeviceGps.processVehicleAndFence(object.vehicles,object.fences,object.startTime,object.endTime,object.timeInterval,userId,companyId,function(result){
                                            res.send(result);
                                            return;
                                        });
                                    }
                                });
                            }else{
                                DeviceGps.processVehicleAndFence(object.vehicles,object.fences,object.startTime,object.endTime,object.timeInterval,userId,companyId,function(result){
                                    res.send(result);
                                    return;
                                });
                            }
                        }else{
                            result={};
                            result.returnStatus = "EMPTY";
                            res.send(result);
                            return;
                        }
                    }
                }else{
                    result={};
                    result.returnStatus = "EMPTY";
                    res.send(result);
                    return;
                }
            }
            else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
                return;
            }
        });
    };
    DeviceGps.remoteMethod(
        'fenceReport',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/FenceReport',verb:'post'}
        }
    );

    DeviceGps.processVehicleAndFence = function(vehicles,fences,startTime,endTime,timeInterval,userId,companyId,callback){
        var i=0;
        var result = {};
        result.responseData = [];
        result.returnStatus = "SUCCESS";
        var todayEnd = moment().format('YYYY-MM-DD HH:mm:ss');
        (function processOne(){
            if(i>=vehicles.length){
                callback(result);
                return;
            }else{
                var deviceId = vehicles[i].deviceId;
                var deviceImei = vehicles[i].deviceImei;
                DeviceGps.find({where:{and:[{'deviceImei':deviceImei},{'packetTime':{gte:startTime}},{'packetTime':{lte:todayEnd}},{'packetTime':{lte:endTime}},{'userId':userId},{'companyId':companyId}]},order:'packetTime ASC'},function(err,instance){
                    if(err){
                        i++
                        setTimeout(processOne,0);
                    }else if(instance.length > 1){
                        for(var k=0;k<fences.length;k++){
                            var radiusInMeters = fences[k].radiusInMeters;
                            var centerLat = fences[k].centerLat;
                            var centerLong = fences[k].centerLong;
                            var insideFence = false;
                            var inPacket = '';
                            var outPacket = '';
                            for(var j=0;j<instance.length;j++){
                                var distance = customLib.distanceBwLatLng(centerLat,centerLong,instance[j].latitude,instance[j].longitude);
                                if(insideFence){
                                    if(parseInt(radiusInMeters) < parseFloat(distance*1000)){
                                        outPacket = instance[j];
                                        var inTime = moment(inPacket.packetTime,'ddd MMM DD YYYY HH:mm:ss');
                                        var outTime = moment(outPacket.packetTime,'ddd MMM DD YYYY HH:mm:ss');
                                        var interval = outTime.diff(inTime,'seconds',false);
                                        if(interval >= (timeInterval)*60){
                                            var onePacket = {};
                                            onePacket.deviceImei= vehicles[i].deviceImei;
                                            onePacket.deviceId= vehicles[i].deviceId;
                                            onePacket.deviceName = vehicles[i].deviceName;
                                            onePacket.geoFenceId = fences[k].geoFenceId;
                                            onePacket.geoFenceName = fences[k].geoFenceName;
                                            onePacket.inPacket = inPacket;
                                            onePacket.outPacket = outPacket;
                                            onePacket.duration = interval;
                                            result.responseData.push(onePacket);
                                        }
                                        insideFence = false;
                                        inPacket = '';
                                        outPacket = '';
                                    }
                                }else{
                                    if(parseInt(radiusInMeters) > parseFloat(distance*1000)){
                                        insideFence = true;
                                        inPacket = instance[j];
                                        continue;
                                    }
                                }
                            }
                        }
                        i++
                        setTimeout(processOne,0);
                    }else{
                        i++
                        setTimeout(processOne,0);
                    }
                });
            }
        })();
    }

    DeviceGps.distanceReport = function(req,res,next){
        var result = {};
        result.responseData = {};
        var start_time = null;
        var end_time = null;
        var distanceCovered = null;
        var todayEnd = moment().format('YYYY-MM-DD HH:mm:ss');
        customLib.validateCookies(req,function(status,user){
            if(status){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY")
                    var userId = req.body.userId;
                else if(userType == "USER")
                    var userId = user.userId;

                var userLoginName = user.vtsLogin.userName;
                var companyId = user.vtsLogin.companyId;

                DeviceGps.find({where:{and:[{'deviceImei':req.query.imei},{'packetTime':{gte:req.query.startTime}},{'packetTime':{lte:todayEnd}},{'packetTime':{lte:req.query.endTime}},{'userId':userId},{'companyId':companyId}]},order:'packetTime DESC'},function(err,instance){
                    if(err){
                        result = {};
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else if(instance.length>1){
                        result.responseData.instance = instance;
                        var found = false;
                        for(var i=0;i<instance.length;i++){
                            if(instance[i].speed > 0){
                                start_time = moment(instance[i].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss');
                                found = true;
                                break;
                            }
                        }
                        for(var i=(instance.length-1);i>=0;i--){
                            if(instance[i].speed>0){
                                if(i== (instance.length-1))
                                    end_time = moment(instance[i].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss');
                                else
                                    end_time = moment(instance[i+1].packetTime,'ddd MMM DD YYYY HH:mm:ss').format('MMMM Do YYYY, HH:mm:ss');
                                found =true;
                                break;
                            }
                        }
                        if(found){
                            if(distanceCovered == null){
                                distanceCovered = instance[0].odometer-instance[instance.length-1].odometer ;
                                distanceCovered = Math.round(distanceCovered*100)/100;
                            }
                            result.responseData.deviceId = req.query.deviceId;
                            result.responseData.deviceImei = req.query.imei;
                            result.responseData.distanceCovered = distanceCovered;
                            result.responseData.startTime = start_time;
                            result.responseData.endTime = end_time;
                            result.returnStatus = "SUCCESS";
                            res.send(result);
                        }else{
                            result.returnStatus = "EMPTY";
                            res.send(result);
                        } 
                    }else{
                        result.returnStatus = "EMPTY";
                        res.send(result);
                    }
                });
            }
            else{
                result = {};
                result.returnStatus = "FAILED";
                res.send(result);
            }
        });
    };
    DeviceGps.remoteMethod(
        'distanceReport',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/DistanceReport',verb:'get'}
        }
    ); 


    DeviceGps.createPacket = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                var userId="";
                if(userType == "COMPANY"){
                    userId = req.body.userId;
                }
                else if(userType == "USER") {
                    result = {};
                    result.returnStatus="ERROR";
                    res.send(result);
                }

                var userLoginName = user.vtsLogin.userName;
                var companyId = user.vtsLogin.companyId;
                var packet = {};
                var object = req.body;
                console.log('Object is '+JSON.stringify(object));
                if(object.latitude != null && object.latitude != "" ){
                    packet.latitude = object.latitude;
                }
                if(object.longitude != null && object.longitude != "" ){
                    packet.longitude = object.longitude;
                }
                if(object.speed != null && object.speed != "" ){
                    packet.speed = object.speed;
                }
                if(object.odometer != null && object.odometer != "" ){
                    packet.odometer = object.odometer;
                }
                if(object.packetTime != null && object.packetTime != "" ){
                    packet.packetTime = moment(object.packetTime,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                }
                packet.vehicleId = object.vehicleId;
                packet.deviceImei = object.deviceImei;
                packet.userId = userId;
                packet.companyId = companyId;
                console.log('Object is '+JSON.stringify(packet));
                DeviceGps.create(packet,function(err,obj){
                    if(err){
                        result = {};
                        console.log('Error is '+err);
                        result.returnStatus="ERROR";
                        res.send(result);
                    }else if(obj == null){
                        result = {};
                        result.returnStatus="EMPTY";
                        res.send(result);
                    }else{
                        result = {};
                        result.returnStatus="SUCCESS";
                        res.send(result);
                    }
                });
            }else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
            }
        });
    };
    DeviceGps.remoteMethod(
        'createPacket',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/CreatePacket',verb:'post'}
        }
    ); 

    DeviceGps.updatePacket = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                var userId = "";
                if(userType == "COMPANY"){
                    userId = req.body.userId;
                }else if(userType == "USER") {
                    var result = {};
                    result.returnStatus="ERROR";
                    res.send(result);
                }

                var userLoginName = user.vtsLogin.userName;
                var companyId = user.vtsLogin.companyId;

                DeviceGps.findById(req.body.packetId,function(err,instance){
                    if(err){
                        result = {};
                        console.log('Error is '+err);
                        result.returnStatus="ERROR";
                        res.send(result);
                    }else if(instance == null){
                        result = {};
                        result.returnStatus="EMPTY";
                        res.send(result);
                    }else{
                        var packet = {};
                        var object = req.body;
                        console.log('Object is '+JSON.stringify(object));
                        if(instance.companyId != companyId){
                            result = {};
                            result.returnStatus="EMPTY";
                            res.send(result);
                            return;
                        }

                        if(object.latitude != null && object.latitude != "" ){
                            packet.latitude = object.latitude;
                        }
                        if(object.longitude != null && object.longitude != "" ){
                            packet.longitude = object.longitude;
                        }
                        if(object.speed != null && object.speed != "" ){
                            packet.speed = object.speed;
                        }
                        if(object.odometer != null && object.odometer != "" ){
                            packet.odometer = object.odometer;
                        }
                        if(object.packetTime != null && object.packetTime != "" ){
                            packet.packetTime = moment(object.packetTime,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                        }
                        console.log('Object is '+JSON.stringify(packet));
                        instance.updateAttributes(packet,function(err,obj){
                            if(err){
                                result = {};
                                console.log('Error is '+err);
                                result.returnStatus="ERROR";
                                res.send(result);
                            }else if(instance == null){
                                result = {};
                                result.returnStatus="EMPTY";
                                res.send(result);
                            }else{
                                result = {};
                                result.returnStatus="SUCCESS";
                                res.send(result);
                            }
                        });
                    }
                });
            }else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
            }
        });
    };
    DeviceGps.remoteMethod(
        'updatePacket',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/UpdatePacket',verb:'post'}
        }
    );

    DeviceGps.deletePacket = function(req,res,next){
        var result = {};
        customLib.validateCookies(req,function(validated,user){
            if(validated){

                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                var userId = "";
                if(userType == "COMPANY")
                    userId = req.query.userId;
                else if (userType == "USER"){
                    result = {};
                    result.returnStatus="ERROR";
                    res.send(result);
                }

                var companyId = user.vtsLogin.companyId;

                DeviceGps.destroyAll({'packetId':req.query.packetId,'companyId': companyId},function(err){
                    if(err){
                        result = {};
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else{ 
                        result = {};
                        result.returnStatus = "SUCCESS";
                        res.send(result);
                    }
                });
            }
            else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
            }
        });
    };
    DeviceGps.remoteMethod(
        'deletePacket',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/deletePacket',verb:'get'}
        }
    );

};

