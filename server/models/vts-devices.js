module.exports = function(VtsDevices) {
    var customLib = require('../../server/customlib.js');
    var app = require('../../server/server.js');
    var moment = require('moment');
    var result = {};
    VtsDevices.queryDevices = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY")
                    var userId = req.query.userId;
                else if(userType == "USER")
                    var userId = user.userId;

                var companyId = user.vtsLogin.companyId;

                var object = req.body;
                var device = {};

                var ds = app.datasources.MySqlDB;
                var sqlQuery =  'select device_id as deviceId,device_name as deviceName,device_imei as deviceImei from vts_devices d where (d.device_name  like "%'+req.query.queryString+'%" or d.device_sim like "%'+req.query.queryString+'%" or d.device_imei like "%'+req.query.queryString+'%") and d.user_id  = '+userId+' and d.company_id = '+companyId;
                ds.connector.execute(sqlQuery, [], function (err, instance) {
                    if(err){
                        result = {};
                        console.log('Error is '+err);
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else{
                        if(instance.length!=0){
                            result = {};
                            result.responseData = instance;
                            result.returnStatus = "SUCCESS";
                            res.send(result);
                        }else{
                            result = {};
                            result.returnStatus = "EMPTY";
                            res.send(result);
                        }
                    }
                });
            }else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
            }
        });
    };
    VtsDevices.remoteMethod(
        'queryDevices',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/QueryDevices',verb:'get'}
        }
    );

    VtsDevices.updateDevice = function(req,res,next){
		customLib.validateCookies(req,function(validated,user){
			if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "ADMIN")
                    var userId = req.body.userId;
                else if(userType == "COMPANY")
                    var userId = req.body.userId;
                else
                    var userId = user.userId;

                var companyId = user.vtsLogin.companyId;

                var object = req.body;
                var device = {};
                if(object.deviceName != null || object.deviceName != null ){
                    device.deviceName = object.deviceName;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.deviceImei != null || object.deviceImei != null ){
                    device.deviceImei = object.deviceImei;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.deviceSim != null || object.deviceSim != null ){
                    device.deviceSim = object.deviceSim;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.comments != ''){
                    device.comments = object.comments;
                }else{
                    device.comments = null;
                }
                device.deviceId = object.deviceId
                if(userType == "ADMIN"){
                    device.companyId = userId;
                }else{
                    device.companyId = companyId;
                }
                device.userId = userId;
                device.vehicleType = object.vehicleType;
                device.driverId = object.driver.driverId;
				VtsDevices.updateAll({deviceId:req.body.deviceId},device,function(err,info){
                    if(err){
                        result = {};
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else if(info.count == 1){
                        result = {};
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
    VtsDevices.remoteMethod(
        'updateDevice',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/UpdateDevice',verb:'post'}
        }
    );
    VtsDevices.deleteDevice = function(req,res,next){
        var result = {};
		customLib.validateCookies(req,function(validated,user){
			if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY")
                    var userId = req.query.userId;
                else if(userType == "USER")
                    var userId = user.userId;

                var companyId = user.vtsLogin.companyId;

				VtsDevices.destroyById(req.query.deviceId,function(err){
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
    VtsDevices.remoteMethod(
        'deleteDevice',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/DeleteDevice',verb:'get'}
        }
    );

    VtsDevices.getVehiclesOfUser = function(req,res,next){
		customLib.validateCookies(req,function(validated,user){
			if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY" )
                	var userId = req.query.userId;
                else if(userType == "USER")
                	var userId = user.userId;

                if(userType == "ADMIN"){
                    var userId = req.query.userId;
                    if(userId == 'ALL'){
                        VtsDevices.find(function(err,instance){
                            if(instance.length!=0){
                                result = {};
                                result.responseData = instance;
                                result.returnStatus = "SUCCESS";
                                res.send(result);
                            }else{
                                result = {};
                                result.returnStatus="EMPTY";
                                console.log(" error is "+err);
                                res.send(result);
                            }
                        });
                    } else {
                        var companyId = req.query.userId;
                        console.log("Company id is "+companyId+", UserId is "+ userId);
                        VtsDevices.find({where:{'companyId':companyId}},function(err,instance){
                            if(instance.length!=0){
                                result = {};
                                result.responseData = instance;
                                result.returnStatus = "SUCCESS";
                                res.send(result);
                            }else{
                                result = {};
                                result.returnStatus="EMPTY";
                                console.log("error is"+err);
                                res.send(result);
                            }
                        });
                    }
                }else{
                    if(userId == 'ALL') {
                        var companyId = user.vtsLogin.companyId;
                        VtsDevices.find({where:{'companyId':companyId}},function(err,instance){
                            if(instance.length!=0){
                                result = {};
                                result.responseData = instance;
                                result.returnStatus = "SUCCESS";
                                res.send(result);
                            }else{
                                result = {};
                                result.returnStatus="EMPTY";
                                res.send(result);
                            }
                        }); 
                    } else {
                        var companyId = user.vtsLogin.companyId;
                        VtsDevices.find({where:{'and':[{'companyId':companyId},{'userId':userId}]}},function(err,instance){
                            if(instance.length!=0){
                                result = {};
                                result.responseData = instance;
                                result.returnStatus = "SUCCESS";
                                res.send(result);
                            }else{
                                result = {};
                                result.returnStatus="EMPTY";
                                res.send(result);
                            }
                        }); 
                    }
                }
			}else{
				result = {};
				result.returnStatus="FAILED";
				res.send(result);
			}
        });
    };
    VtsDevices.remoteMethod(
        'getVehiclesOfUser',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/VehiclesOfUser',verb:'get'}
        }
    );


    VtsDevices.checkImei = function(req,res,next){
		customLib.validateCookies(req,function(validated,user){
			if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY")
                	var userId = req.query.userId;
                else if(userType == "USER")
                	var userId = user.userId;

                var companyId = user.vtsLogin.companyId;
				VtsDevices.find({where:{'and':[{'companyId':companyId},{'deviceImei':req.query.deviceImei}]}},function(err,instance){
					if(instance.length==0){
						result={};
						result.returnStatus = "SUCCESS";
						res.send(result);
					}else{
						result = {};
						result.returnStatus="ERROR";
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
    VtsDevices.remoteMethod(
        'checkImei',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/CheckImei',verb:'get'}
        }
    );


    VtsDevices.createDevice = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
			if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "ADMIN")
                    var userId = req.body.userId;
                else if(userType == "COMPANY")
                	var userId = req.body.userId;
                else 
                	var userId = user.userId;

                var userLoginName = user.vtsLogin.userName;
                var companyId = user.vtsLogin.companyId;

                var object = req.body;
                var device = {};
                
                

	            if(object.deviceName != null || object.deviceName != null ){
                	device.deviceName = object.deviceName;
                }else{
	            	result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
	            }
                if(object.deviceImei != null || object.deviceImei != null ){
                	device.deviceImei = object.deviceImei;
                }else{
	            	result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
	            }
                if(object.deviceSim != null || object.deviceSim != null ){
                	device.deviceSim = object.deviceSim;
                }else{
	            	result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
	            }
	            if(object.comments != ''){
                	device.comments = object.comments;
                }else{
	            	device.comments = null;
	            }
                if(userType == "ADMIN"){
                    device.companyId = userId;
                }else{
                    device.companyId = companyId;
                }
                device.userId = userId;
	            device.vehicleType = object.vehicleType;
	            device.driverId = object.driver.driverId;

                VtsDevices.create(device,function(err,obj){
                    if(err){
                        result = {}
                        console.log('err is '+err);
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else if(obj == null){
                        result = {}
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else{
                        result = {}
                        result.returnStatus = "SUCCESS";
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
    VtsDevices.remoteMethod(
        'createDevice',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/CreateDevice',verb:'post'}
        }
    );

};