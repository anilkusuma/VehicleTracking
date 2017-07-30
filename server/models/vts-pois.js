module.exports = function(VtsPois) {
    var customLib = require('../../server/customlib.js');
    var app = require('../../server/server.js');
    var moment = require('moment');
    var bodyParser = require('body-parser').urlencoded({extended: true});
    var result = {};
    VtsPois.updatePoi = function(req,res,next){
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
                var poi = {};
                
                

                if(object.poiName != null || object.poiName != null ){
                    poi.poiName = object.poiName;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.poiLat != null || object.poiLat != null ){
                    poi.poiLat = object.poiLat;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.poiLong != null || object.poiLong != null ){
                    poi.poiLong = object.poiLong;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.poiAddress != null || object.poiAddress != null ){
                    poi.poiAddress = object.poiAddress;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                poi.companyId = companyId;
                poi.userId = userId;
                poi.poiId= req.body.poiId;

                VtsPois.updateAll({poiId:req.body.poiId},poi,function(err,info){
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
    VtsPois.remoteMethod(
        'updatePoi',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/UpdatePoi',verb:'post'}
        }
    );

    VtsPois.deletePoi = function(req,res,next){
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

                VtsPois.destroyById(req.query.poiId,function(err){
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
    VtsPois.remoteMethod(
        'deletePoi',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/DeletePoi',verb:'get'}
        }
    );


    VtsPois.getPoisOfUser = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY")
                    var userId = req.query.userId;
                else if(userType == "USER")
                    var userId = user.userId;

                var companyId = user.vtsLogin.companyId;

                VtsPois.find({where:{'and':[{'companyId':companyId},{'userId':userId}]}},function(err,instance){
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
    VtsPois.remoteMethod(
        'getPoisOfUser',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/PoisOfUser',verb:'get'}
        }
    );

    VtsPois.createPoi = function(req,res,next){
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
                var poi = {};
                
                

                if(object.poiName != null || object.poiName != null ){
                    poi.poiName = object.poiName;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.poiLat != null || object.poiLat != null ){
                    poi.poiLat = object.poiLat;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.poiLong != null || object.poiLong != null ){
                    poi.poiLong = object.poiLong;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.poiAddress != null || object.poiAddress != null ){
                    poi.poiAddress = object.poiAddress;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                poi.companyId = companyId;
                poi.userId = userId;

                VtsPois.create(poi,function(err,obj){
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
    VtsPois.remoteMethod(
        'createPoi',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/CreatePoi',verb:'post'}
        }
    );
 };