module.exports = function(VtsDrivers) {
    var customLib = require('../../server/customlib.js');
    var app = require('../../server/server.js');
    var moment = require('moment');
    var result = {};
    
    VtsDrivers.updateDriver = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY")
                    var userId = req.body.userId;
                else if(userType == "USER")
                    var userId = user.userId;

                var userLoginName = user.vtsLogin.userName;
                var companyId = user.vtsLogin.companyId;

                var object = req.body;
                var driver = {};
                
                //console.log('object is '+JSON.stringify(object));

                if(object.name != null || object.name != null ){
                    driver.name = object.name;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }

                if(object.emailId != null || object.emailId != null ){
                    driver.emailId = object.emailId;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.mobileNumber != null || object.mobileNumber != null ){
                    driver.mobileNumber = object.mobileNumber;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }

                driver.driverId = object.driverId
                driver.companyId = companyId;
                driver.userId = userId;

                VtsDrivers.updateAll({driverId:req.body.driverId},driver,function(err,info){
                    if(err){
                        console.log('error and info is '+err+ ' ')
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
    VtsDrivers.remoteMethod(
        'updateDriver',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/UpdateDriver',verb:'post'}
        }
    );
    VtsDrivers.deleteDriver = function(req,res,next){
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

                VtsDrivers.destroyById(req.query.driverId,function(err){
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
    VtsDrivers.remoteMethod(
        'deleteDriver',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/DeleteDriver',verb:'get'}
        }
    );

    VtsDrivers.getDriversOfUser = function(req,res,next){
		customLib.validateCookies(req,function(validated,user){
			if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY")
                	var userId = req.query.userId;
                else if(userType == "USER")
                	var userId = user.userId;

                var companyId = user.vtsLogin.companyId;

				VtsDrivers.find({where:{'and':[{'companyId':companyId},{'userId':userId}]}},function(err,instance){
					if(instance.length!=0){
						var result = {};
						result.responseData = instance;
						result.returnStatus = "SUCCESS";
						res.send(result);
					}else{
						var result = {};
						result.returnStatus="EMPTY";
						res.send(result);
					}
				});
			}else{
				var result = {};
				result.returnStatus="FAILED";
				res.send(result);
			}
        });
    };
    VtsDrivers.remoteMethod(
        'getDriversOfUser',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/DriversOfUser',verb:'get'}
        }
    );

    VtsDrivers.createDriver = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
			if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY")
                	var userId = req.body.userId;
                else if(userType == "USER")
                	var userId = user.userId;

                var userLoginName = user.vtsLogin.userName;
                var companyId = user.vtsLogin.companyId;

                var object = req.body;
                var driver = {};
                
                

	            if(object.name != null || object.name != null ){
                	driver.name = object.name;
                }else{
	            	result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
	            }
                if(object.emailId != null || object.emailId != null ){
                	driver.emailId = object.emailId;
                }else{
	            	result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
	            }
                if(object.mobileNumber != null || object.mobileNumber != null ){
                	driver.mobileNumber = object.mobileNumber;
                }else{
	            	result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
	            }
	            driver.companyId = companyId;
                driver.userId = userId;

                VtsDrivers.create(driver,function(err,obj){
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
    VtsDrivers.remoteMethod(
        'createDriver',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/CreateDriver',verb:'post'}
        }
    );
 
 };