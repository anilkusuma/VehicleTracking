module.exports = function(VtsGeoFencing) {
    var customLib = require('../../server/customlib.js');
    var app = require('../../server/server.js');
    var moment = require('moment');
    var bodyParser = require('body-parser').urlencoded({extended: true});
    var result = {};
    VtsGeoFencing.queryFences = function(req,res,next){
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
                var sqlQuery =  'select geo_fence_id as geoFenceId,geo_fence_name as geoFenceName,center_lat as centerLat,center_long as centerLong,radius_in_meters as radiusInMeters,center_string as centerString from vts_geo_fencing d where (d.geo_fence_name  like "%'+req.query.queryString+'%" or d.center_string like "%'+req.query.queryString+'%") and d.user_id  = '+userId+' and d.company_id = '+companyId;
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
    VtsGeoFencing.remoteMethod(
        'queryFences',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/QueryGeoFence',verb:'get'}
        }
    );
    VtsGeoFencing.getFencesOfUser = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY")
                    var userId = req.query.userId;
                else if(userType == "USER")
                    var userId = user.userId;

                var companyId = user.vtsLogin.companyId;

                VtsGeoFencing.find({where:{'and':[{'companyId':companyId},{'userId':userId}]}},function(err,instance){
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
    VtsGeoFencing.remoteMethod(
        'getFencesOfUser',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/FencesOfUser',verb:'get'}
        }
    );
    
    VtsGeoFencing.bUpdateGeoFence = function(req,res,next){
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
                var fence = {};
                
                if(object.geoFenceName != null || object.geoFenceName != null ){
                    fence.geoFenceName = object.geoFenceName;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.centerLat != null || object.centerLat != null ){
                    fence.centerLat = object.centerLat;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.centerLong != null || object.centerLong != null ){
                    fence.centerLong = object.centerLong;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.centerString != null || object.centerString != null ){
                    fence.centerString = object.centerString;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }

                if(object.radiusInMeters != null || object.radiusInMeters != null ){
                    fence.radiusInMeters = object.radiusInMeters;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                fence.companyId = companyId;
                fence.userId = userId;
                fence.color = '#05CDF5';
                fence.geoFenceId = object.geoFenceId;
                VtsGeoFencing.updateAll({'geoFenceId':req.body.geoFenceId},fence,function(err,info){
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
            }else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
            }
        });
    };
    VtsGeoFencing.remoteMethod(
        'bUpdateGeoFence',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/UpdateFence',verb:'post'}
        }
    );

    VtsGeoFencing.createFence = function(req,res,next){
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
                var fence = {};
                
                
                console.log('obj is '+JSON.stringify(object));
                if(object.geoFenceName != null || object.geoFenceName != null ){
                    fence.geoFenceName = object.geoFenceName;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.centerLat != null || object.centerLat != null ){
                    fence.centerLat = object.centerLat;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.centerLong != null || object.centerLong != null ){
                    fence.centerLong = object.centerLong;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.centerString != null || object.centerString != null ){
                    fence.centerString = object.centerString;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }

                if(object.radiusInMeters != null || object.radiusInMeters != null ){
                    fence.radiusInMeters = object.radiusInMeters;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                fence.companyId = companyId;
                fence.userId = userId;
                fence.color = '#05CDF5';

                VtsGeoFencing.create(fence,function(err,obj){
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
    VtsGeoFencing.remoteMethod(
        'createFence',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/CreateFence',verb:'post'}
        }
    );
    
    VtsGeoFencing.deleteGeoFenceDetails = function(req,res,next){
        var result = {};
		customLib.validateCookies(req,function(status){
			if(status){
				VtsGeoFencing.destroyById(req.query.geoFenceId,function(err){
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
				result.returnStatus = "FAILED";
				res.send(result);
			}
        });
    };
    VtsGeoFencing.remoteMethod(
        'deleteGeoFenceDetails',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/DeleteFence',verb:'get'}
        }
    );
 };