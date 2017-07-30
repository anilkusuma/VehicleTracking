module.exports = function(VtsServer) {
	var customLib = require('../../server/customlib.js');
    var app = require('../../server/server.js');
    var moment = require('moment');
    VtsServer.lastTwoPacketsOfVehicles = function(req,res,next){
        var result = {};
		customLib.validateSelectors(req.query.v,req.query.s,req.query.userId,function(status){
			if(status){
				VtsServer.find({where:{'deviceImei':req.query.imei},order:'packetTime DESC',limit:2},function(err,instance){
					if(instance.length!=0){
						result.responseData = instance;
						result.gpsData = "SUCCESS";
						result.loginStatus = "SUCCESS";
						res.send(result);
					}else{
						result = {};
						result.loginStatus="SUCCESS";
						result.gpsData = "EMPTY";
						result.failureReason="NOGPSPACKETS";
						res.send(result);
					}
				});
			}
			else{
				result = {};
				result.loginStatus="FAILED";
				result.vehicleStatus = "FAILED";
				result.failureReason="COMBINATIONDOESNOTEXIST";
				res.send(result);
			}
        });
    };
    VtsServer.remoteMethod(
        'lastTwoPacketsOfVehicles',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/latestPackets',verb:'get'}
        }
    );    
    VtsServer.bLastTwoPacketsOfVehicles = function(req,res,next){
        var result = {};
		customLib.validateCookies(req,function(status){
			console.log('status is'+status);
			if(status){
				VtsServer.find({where:{'deviceImei':req.query.imei},order:'packetTime DESC',limit:2},function(err,instance){
					if(instance.length!=0){
						result.responseData = instance;
						result.gpsData = "SUCCESS";
						result.loginStatus = "SUCCESS";
						res.send(result);
					}else{
						result = {};
						result.loginStatus="SUCCESS";
						result.gpsData = "EMPTY";
						result.failureReason="NOGPSPACKETS";
						res.send(result);
					}
				});
			}
			else{
				result = {};
				result.loginStatus="FAILED";
				result.vehicleStatus = "FAILED";
				result.failureReason="COMBINATIONDOESNOTEXIST";
				res.send(result);
			}
        });
    };
    VtsServer.remoteMethod(
        'bLastTwoPacketsOfVehicles',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/bLatestPackets',verb:'get'}
        }
    ); 
    VtsServer.getSelectedDatePackets = function(req,res,next){
        var result = {};
		customLib.validateSelectors(req.query.v,req.query.s,req.query.userId,function(status){
			console.log('status is'+status);
			if(status){
				VtsServer.find({where:{and:[{'deviceImei':req.query.imei},{'packetDate':req.query.date}]},order:'packetTime DESC'},function(err,instance){
					result = {};
					if(instance.length!=0){
						console.log(instance);
						instance = instance.reverse();
						result.responseData = instance;
						var totalDistanceCovered = instance[instance.length-1].odometer-instance[0].odometer;
						console.log('Total distance covered'+totalDistanceCovered);
						
						var startTime = instance[0].packetTime;
						var endTime = instance[instance.length-1].packetTime;
						
						result.totalDistanceCovered = totalDistanceCovered;
						result.startTime = startTime;
						result.endTime = endTime;
						
						//var firstQOdometer,sQO,tQO,fQO;
						
//						for(int i=0;i<instance.length;i++){
//							var timeC = new Date(instance[i].packetTime);
					 
						result.gpsData = "SUCCESS";
						result.loginStatus = "SUCCESS";
						res.send(result);
					}else{
						result.loginStatus="SUCCESS";
						result.gpsData = "EMPTY";
						result.failureReason="NOPACKETSFORDAY";
						res.send(result);
					}
				});
			}
			else{
				result = {};
				result.loginStatus="FAILED";
				result.vehicleStatus = "FAILED";
				result.failureReason="COMBINATIONDOESNOTEXIST";
				res.send(result);
			}
        });
    };
    VtsServer.remoteMethod(
        'getSelectedDatePackets',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/getReplayPackets',verb:'get'}
        }
    );
    VtsServer.bGetSelectedDatePackets = function(req,res,next){
        var result = {};
		customLib.validateCookies(req,function(status){
			console.log('status is'+status);
			if(status){
				VtsServer.find({where:{and:[{'deviceImei':req.query.imei},{'packetDate':req.query.date}]},order:'packetTime DESC'},function(err,instance){
					result = {};
                    console.log(instance);
					if(instance.length!=0){
						console.log(instance);
						result.responseData = instance;
						var totalDistanceCovered = instance[0].odometer-instance[instance.length-1].odometer;
						console.log('Total distance covered'+totalDistanceCovered);
						
						var startTime = instance[instance.length-1].packetTime;
						var endTime = instance[0].packetTime;
						
						result.totalDistanceCovered = totalDistanceCovered;
						result.startTime = startTime;
						result.endTime = endTime;
						
						//var firstQOdometer,sQO,tQO,fQO;
						
//						for(int i=0;i<instance.length;i++){
//							var timeC = new Date(instance[i].packetTime);
					 
						result.gpsData = "SUCCESS";
						result.loginStatus = "SUCCESS";
						res.send(result);
					}else{
						result.loginStatus="SUCCESS";
						result.gpsData = "EMPTY";
						result.failureReason="NOPACKETSFORDAY";
						res.send(result);
					}
				});
			}
			else{
				result = {};
				result.loginStatus="FAILED";
				result.vehicleStatus = "FAILED";
				result.failureReason="COMBINATIONDOESNOTEXIST";
				res.send(result);
			}
        });
    };
    VtsServer.remoteMethod(
        'bGetSelectedDatePackets',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/bGetReplayPackets',verb:'get'}
        }
    );
    
    VtsServer.bGetSelectedTimePackets = function(req,res,next){
        var result = {};
        var start_time = null;
		var end_time = null;
		var startLocation = null;
		var endLocation = null,averageSpeed = null,maximumSpeed = null,numberOfStops = null,distanceCovered = null;
		customLib.validateCookies(req,function(status){
            var startTime = moment.utc(req.query.startTime,'YYYY/MM/DD HH:mm:ss');
            var endTime = moment.utc(req.query.endTime,'YYYY/MM/DD HH:mm:ss');
			console.log('status is'+status+' '+ new Date(req.query.startTime)+' '+new Date(req.query.endTime));
			if(status){
				VtsServer.find({where:{and:[{'deviceImei':req.query.imei},{'packetTime':{gte:startTime}},{'packetTime':{lte:endTime}}]},order:'packetTime DESC'},function(err,instance){
					result = {};
					if(instance.length>1){
                        var max = 0;
                        var sum = 0;
                        var count=0;
						result.responseData = instance;
                        if(start_time == null){
                            start_time = moment.utc(instance[instance.length-1].packetTime).format('MMMM Do YYYY, HH:mm:ss');
                        }
                        if(end_time == null){
                            end_time = moment.utc(instance[0].packetTime).format('MMMM Do YYYY, HH:mm:ss');
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
                            
                        result.vehicleId = req.query.vehicleId;
                        result.deviceImei = req.query.imei;
                        result.startLocation = startLocation;
                        result.endLocation = endLocation;
                        result.distanceCovered = distanceCovered;
                        result.maximumSpeed = maximumSpeed;
                        result.averageSpeed = averageSpeed;
                        result.numberOfStops = numberOfStops;
						result.startTime = start_time;
						result.endTime = end_time;
						result.gpsData = "SUCCESS";
						result.loginStatus = "SUCCESS";
						res.send(result);
					}else{
						result.loginStatus="SUCCESS";
						result.gpsData = "EMPTY";
						result.failureReason="NOPACKETSINGIVENTIME";
						res.send(result);
					}
				});
			}
			else{
				result = {};
				result.loginStatus="FAILED";
				result.vehicleStatus = "FAILED";
				result.failureReason="COMBINATIONDOESNOTEXIST";
				res.send(result);
			}
        });
    };
    VtsServer.remoteMethod(
        'bGetSelectedTimePackets',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/bGetReplayTimePackets',verb:'get'}
        }
    );
    
    VtsServer.bGetTodayTimePackets = function(req,res,next){
        var result = {};
        var start_time = null;
		var end_time = null;
		var startLocation = null;
		var endLocation = null,averageSpeed = null,maximumSpeed = null,numberOfStops = null,distanceCovered = null;
		customLib.validateCookies(req,function(status){
            var today = moment.utc().format('YYYY-MM-DD');
			if(status){
                console.log('today value is '+today+' '+req.query.imei);
				VtsServer.find({where:{and:[{'deviceImei':req.query.imei},{'packetDate':today}]},order:'packetTime DESC'},function(err,instance){
					result = {};
					if(instance.length > 1){
                        var max = 0;
                        var sum = 0;
                        var count=0;
						result.responseData = instance;
						if(start_time == null){
                            start_time = moment.utc(instance[instance.length-1].packetTime).format('MMMM Do YYYY, HH:mm:ss');
                        }
                        if(end_time == null){
                            end_time = moment.utc(instance[0].packetTime).format('MMMM Do YYYY, HH:mm:ss');
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
                            
                        result.vehicleId = req.query.vehicleId;
                        result.deviceImei = req.query.imei;
                        result.startLocation = startLocation;
                        result.endLocation = endLocation;
                        result.distanceCovered = distanceCovered;
                        result.maximumSpeed = maximumSpeed;
                        result.averageSpeed = averageSpeed;
                        result.numberOfStops = numberOfStops;
						result.startTime = start_time;
						result.endTime = end_time;
						result.gpsData = "SUCCESS";
						result.loginStatus = "SUCCESS";
						res.send(result);
					}else{
						result.loginStatus="SUCCESS";
						result.gpsData = "EMPTY";
						result.failureReason="NOPACKETSINGIVENTIME";
						res.send(result);
					}
				});
			}
			else{
				result = {};
				result.loginStatus="FAILED";
				result.vehicleStatus = "FAILED";
				result.failureReason="COMBINATIONDOESNOTEXIST";
				res.send(result);
			}
        });
    };
    VtsServer.remoteMethod(
        'bGetTodayTimePackets',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/bGetTodayPackets',verb:'get'}
        }
    );
    
    VtsServer.bGetGeneralDayReports = function(req,res,next){
        var result = {};
        var startTime = null;
		var endTime = null;
		var startLocation = null;
		var endLocation = null,averageSpeed = null,maximumSpeed = null,numberOfStops = null,distanceCovered = null;
		customLib.validateCookies(req,function(status){
            var selDate = moment.utc(req.query.selDate,'YYYY/MM/DD').format('YYYY-MM-DD');
			if(status){
                VtsServer.find({where:{and:[{'deviceImei':req.query.imei},{'packetDate':selDate}]},order:'packetTime DESC'},function(err,instance){
					result = {};
                    var max = 0;
                    var sum = 0;
                    var count=0;
					if(instance.length>1){
						if(instance.length > 1)
                        {
                            if(startTime == null){
                                startTime = moment.utc(instance[instance.length-1].packetTime).format('MMMM Do YYYY, HH:mm:ss');
                            }
                            if(endTime == null){
                                endTime = moment.utc(instance[0].packetTime).format('MMMM Do YYYY, HH:mm:ss');
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
                                    console.log('max value is '+max);
                                }
                                sum = parseInt(instance[i].speed)+parseInt(sum);
                                if(parseInt(instance[i].speed) ==0){
                                    count= count+1;
                                }
                            }
                        }
                        maximumSpeed = max;
                        averageSpeed = parseInt(sum)/parseInt(instance.length);
                        numberOfStops = count;
                        distanceCovered = Math.round(distanceCovered*100)/100;
                        averageSpeed = Math.round(averageSpeed*100)/100;
                            
                        result.vehicleId = req.query.vehicleId;
                        result.deviceImei = req.query.imei;
                        result.startTime = startTime;
                        result.endTime = endTime;
                        result.startLocation = startLocation;
                        result.endLocation = endLocation;
                        result.distanceCovered = distanceCovered;
                        result.maximumSpeed = maximumSpeed;
                        result.averageSpeed = averageSpeed;
                        result.numberOfStops = numberOfStops;
						result.dayData = "SUCCESS";
						result.loginStatus = "SUCCESS";
						res.send(result);
					}else{
						result.loginStatus="SUCCESS";
						result.dayData = "EMPTY";
						result.failureReason="NOPACKETSINGIVENTIME";
						res.send(result);
					}
				});
			}
			else{
				result = {};
				result.loginStatus="FAILED";
				result.dayData = "FAILED";
				result.failureReason="COMBINATIONDOESNOTEXIST";
				res.send(result);
			}
        });
    };
    VtsServer.remoteMethod(
        'bGetGeneralDayReports',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/bGenReport',verb:'get'}
        }
    );
    VtsServer.bGetDetailedDayReport = function(req,res,next){
        var result = {};
		customLib.validateCookies(req,function(status){
            var selDate = moment.utc(req.query.selDate,'YYYY/MM/DD').format('YYYY-MM-DD');
			if(status){
				VtsServer.find({where:{and:[{'deviceImei':req.query.imei},{'packetDate':selDate}]},order:'packetTime DESC'},function(err,instance){
					result = {};
					if(instance.length!=0){
						result.responseData = instance;
						result.detailDayData = "SUCCESS";
						result.loginStatus = "SUCCESS";
						res.send(result);
					}else{
						result.loginStatus="SUCCESS";
						result.detailDayData = "EMPTY";
						result.failureReason="NOPACKETSINGIVENTIME";
						res.send(result);
					}
				});
			}
			else{
				result = {};
				result.loginStatus="FAILED";
				result.detailDayData = "FAILED";
				result.failureReason="COMBINATIONDOESNOTEXIST";
				res.send(result);
			}
        });
    };
    VtsServer.remoteMethod(
        'bGetDetailedDayReport',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/bDetReport',verb:'get'}
        }
    );
    VtsServer.bGetOverSpeedReport = function(req,res,next){
        var result = {};
		customLib.validateCookies(req,function(status){
            var startTime = moment.utc(req.query.startTime,'YYYY/MM/DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var endTime = moment.utc(req.query.endTime,'YYYY/MM/DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var speed = parseInt(req.query.minSpeed);
			if(status){
				VtsServer.find({where:{and:[{'deviceImei':req.query.imei},{'packetTime':{gte:startTime}},{'packetTime':{lte:endTime}},{'speed':{gte:speed}}]},order:'packetTime DESC'},function(err,instance){
					result = {};
					if(instance.length!=0){
						result.responseData = instance;
						result.overSpeedData = "SUCCESS";
						result.loginStatus = "SUCCESS";
						res.send(result);
					}else{
						result.loginStatus="SUCCESS";
						result.overSpeedData = "EMPTY";
						result.failureReason="NOPACKETSINGIVENTIME";
						res.send(result);
					}
				});
			}
			else{
				result = {};
				result.loginStatus="FAILED";
				result.overSpeedData = "FAILED";
				result.failureReason="COMBINATIONDOESNOTEXIST";
				res.send(result);
			}
        });
    };
    VtsServer.remoteMethod(
        'bGetOverSpeedReport',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/bSpeedReport',verb:'get'}
        }
    );
    VtsServer.getAllImeiNumbers = function(req,res,next){
        var result = {};
		customLib.validateCookies(req,function(status){
            if(status){
                var ds = app.datasources.MySqlDB;
                console.log('datasource is '+ds);
                var sqlQuery =  'select distinct device_imei from vts_server';
                ds.connector.execute(sqlQuery, [], function (err, server) {
                    if(err){
                        result = {};
                        result.imeiData = "ERROR";
                        result.loginStatus = "SUCCESS";
                        res.send(result);
                    }else{
                        if(server.length!=0){
                            console.log(server);
                            result.responseData = server;
                            result.imeiData = "SUCCESS";
                            result.loginStatus = "SUCCESS";
                            res.send(result);
                        }else{
                            result.loginStatus="SUCCESS";
                            result.imeiData = "EMPTY";
                            result.failureReason="NOPACKETSINGIVENTIME";
                            res.send(result);
                        }
                    }
                });
            }else{
                result = {};
				result.loginStatus="FAILED";
				result.imeiData = "FAILED";
				result.failureReason="COMBINATIONDOESNOTEXIST";
				res.send(result);
            }
        });
    };
    VtsServer.remoteMethod(
        'getAllImeiNumbers',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/allImeis',verb:'get'}
        }
    );
    VtsServer.getLatestPacketOfAllImeiNumbers = function(req,res,next){
        var result = {};
		customLib.validateCookies(req,function(status){
            if(status){
                var ds = app.datasources.MySqlDB;
                console.log('datasource is '+ds);
                var sqlQuery =  'select * from vts_server where device_imei='+req.query.imei+' order by packet_time desc limit 1';
                ds.connector.execute(sqlQuery, [], function (err, server) {
                    if(err){
                        result = {};
                        result.imeiData = "ERROR";
                        result.loginStatus = "SUCCESS";
                        res.send(result);
                    }else{
                        if(server.length!=0){
                            console.log(server);
                            result.responseData = server;
                            result.imeiData = "SUCCESS";
                            result.loginStatus = "SUCCESS";
                            res.send(result);
                        }else{
                            result.loginStatus="SUCCESS";
                            result.imeiData = "EMPTY";
                            result.failureReason="NOPACKETSINGIVENTIME";
                            res.send(result);
                        }
                    }
                });
            }else{
                result = {};
				result.loginStatus="FAILED";
				result.imeiData = "FAILED";
				result.failureReason="COMBINATIONDOESNOTEXIST";
				res.send(result);
            }
        });
    };
    VtsServer.remoteMethod(
        'getLatestPacketOfAllImeiNumbers',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/latestPacketOfImei',verb:'get'}
        }
    );
 };





//'89814429', '48212133', 'e3c05f03b1627b9f279a80d4252329d771562ad4', '2016-07-11 13:06:20', '2016-07-11 13:06:20'104.210.154.46
