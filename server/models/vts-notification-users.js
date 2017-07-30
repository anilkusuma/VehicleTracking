module.exports = function(VtsNotificationUsers) {
    var customLib = require('../../server/customlib.js');
    var app = require('../../server/server.js');
    var moment = require('moment');
    var bodyParser = require('body-parser').urlencoded({extended: true});
    var result = {};

    VtsNotificationUsers.updateUsers = function(req,res,next){
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
                var user = {};
                
                if(object.name != null || object.name != null ){
                    user.name = object.name;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.emailId != null || object.emailId != null ){
                    user.emailId = object.emailId;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.mobileNumber != null || object.mobileNumber != null ){
                    user.mobileNumber = object.mobileNumber;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                user.companyId = companyId;
                user.userId = userId;
                user.notUserId = req.body.notUserId;

                VtsNotificationUsers.updateAll({notUserId:req.body.notUserId},user,function(err,info){
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
    VtsNotificationUsers.remoteMethod(
        'updateUsers',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/UpdateNotUser',verb:'post'}
        }
    );

    VtsNotificationUsers.deleteUser = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){

                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY")
                    var userId = req.query.userId;
                else if(userType == "USER")
                    var userId = user.userId;

                var companyId = user.vtsLogin.companyId;

                VtsNotificationUsers.destroyById(req.query.notUserId,function(err){
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
    VtsNotificationUsers.remoteMethod(
        'deleteUser',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/DeleteNotUser',verb:'get'}
        }
    );


    VtsNotificationUsers.getUsersOfUser = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userType = user.vtsLogin.userType;
                if(userType == "COMPANY")
                    var userId = req.query.userId;
                else if(userType == "USER")
                    var userId = user.userId;

                var companyId = user.vtsLogin.companyId;

                VtsNotificationUsers.find({where:{'and':[{'companyId':companyId},{'userId':userId}]}},function(err,instance){
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
    VtsNotificationUsers.remoteMethod(
        'getUsersOfUser',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/UsersOfUser',verb:'get'}
        }
    );

    VtsNotificationUsers.createUser = function(req,res,next){
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
                var user = {};
                
                

                if(object.name != null || object.name != null ){
                    user.name = object.name;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.emailId != null || object.emailId != null ){
                    user.emailId = object.emailId;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.mobileNumber != null || object.mobileNumber != null ){
                    user.mobileNumber = object.mobileNumber;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                user.companyId = companyId;
                user.userId = userId;

                VtsNotificationUsers.create(user,function(err,obj){
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
    VtsNotificationUsers.remoteMethod(
        'createUser',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/CreateUser',verb:'post'}
        }
    );
 };