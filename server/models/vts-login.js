module.exports = function(VtsLogin) {
    var customLib = require('../../server/customlib.js');
    var crypto = require('crypto');
    var app = require('../../server/server.js');
    var result = {};
    VtsLogin.authenticate = function(req,res,next){
        var password = req.query.password;
        if(password != undefined && password !== null){
            password = crypto.createHash('sha1').update(password).digest('Hex');
        }
        VtsLogin.find({where:{'and':[{'userName':req.query.userName},{'userInformation':password},{'accountActive':'Y'}]},include:'vtsUsers'},function(err,instance){
            if(err){
                console.log(err);
                result = {};
                result.loginStatus = "ERROR";
                result.validatorStatus = "ERROR";
                res.send(err);
            }
            else if(instance.length!=0){
                result = instance[0].toJSON();
                var selector = customLib.getRandom(8);
                var validator = customLib.getRandom(8);
                validator = validator.toString() + instance[0].toJSON().vtsUsers.firstName;
                var userId = instance[0].userId;
                validator = crypto.createHash('sha1').update(validator).digest('Hex');
                app.models.VtsValidator.create({'userId':userId,'selector':selector,'validator':validator},function(err,object){
                    if(err)
                    {

                        result.validator = err;
                        result.validatorStatus="FAILED";
                    }
                    else
                    {
                         result.validator = object;
                         result.validatorStatus="SUCCESS";
                    }
                    result.loginStatus = "SUCCESS";
                    res.send(result);
                });
            }else{
				result = {};
                result.loginStatus="FAILURE";
                result.validatorStatus = "FAILED";
                result.failureReason="COMBINATIONDOESNOTEXIST";
                res.send(result);
            }
        });
    };
    VtsLogin.remoteMethod(
        'authenticate',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/login',verb:'get'}
        }
    );
    VtsLogin.updatePassword = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userID = user.userId;
                var userType = user.vtsLogin.userType;
                var password = req.query.oldPassword;
                password = crypto.createHash('sha1').update(password).digest('Hex');
                VtsLogin.find({where:{'and':[{'userId':userID},{'userInformation':password}]}},function(err,instance){
                    if(instance.length!=0){
                        var newPassword = req.query.newPassword;
                        newPassword = crypto.createHash('sha1').update(newPassword).digest('Hex');
                        VtsLogin.updateAll({'userId':userID},{'userInformation':newPassword},function(err,info){
                            if(err)
                            {
                                result = {};
                                result.returnStatus = 'ERROR';
                                console.log('error values is'+err);
                                res.send(result);
                            }
                            else if(info.count == 1)
                            {
                                result = {};
                                result.returnStatus = 'SUCCESS';
                                res.send(result);
                            }else{
                                result = {};
                                result.returnStatus = 'ERROR';
                                res.send(result);
                            }
                        });
                    }else{
                        result = {};
                        result.returnStatus="EMPTY";
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
    VtsLogin.remoteMethod(
        'updatePassword',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/UpdatePassword',verb:'get'}
        }
    ); 

    VtsLogin.validateUsername = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userID = user.userId;
                var userType = user.vtsLogin.userType;
                customLib.validateUsername(req.query.userName,function(status){
                    if(status){
                        result={};
                        result.returnStatus = "SUCCESS";
                        res.send(result);
                    }else{
                        result = {};
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }
                })
            }else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
            }
        });
    };
    VtsLogin.remoteMethod(
        'validateUsername',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/checkUserName',verb:'get'}
        }
    );        
 };