module.exports = function(VtsUsers) {
    var customLib = require('../../server/customlib.js');
    var app = require('../../server/server.js');
    var result = {};
    var util = require('util');
    var multer = require('multer');
    var crypto = require('crypto');
    var nodemailer = require('nodemailer');
    var xoauth2 = require('xoauth2');
    var moment = require('moment');
    var fs = require('fs-extra');

    VtsUsers.updateProfilePic = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userID = user.userId;
                var userType = user.vtsLogin.userType;
                result={};
                var storage = multer.diskStorage({ //multers disk storage settings
                    destination: function (req, file, cb) {
                        cb(null, __dirname+'/../../client/userimages/')  
                    },
                    filename: function (req, file, cb) {
                        cb(null,userID+'.jpg')
                    }
                });
                var upload = multer({
                                storage: storage,
                                fileFilter : function(req, file, callback) {
                                    if (['jpg', 'png','jpeg','JPG', 'PNG','JPEG'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                                        return callback(new Error('WRONGFILETYPE'));
                                    }
                                    callback(null, true);
                                }
                            }).single('file');
                upload(req,res,function(err){
                    if(err){
                         result={};
                         console.log('error value is '+err);
                         if(err = "WRONGFILETYPE"){
                            result.returnStatus = "WRONGFILETYPE";
                         }else{
                             result.returnStatus = "UPLOADERROR";
                         }
                         res.send(result);
                         return;
                    }
                    /** Multer gives us file info in req.file object */
                    if(!req.file){
                        result={};
                        result.returnStatus = "NOFILEERROR";
                        res.send(result);
                        return;
                    }else{
                        result={};
                        result.returnStatus = "SUCCESS";
                        res.send(result);
                        return;
                    } 
                });   
            }else{
                result = {};
                result.returnStatus="FAILED";
                res.send(result);
            }
        });
    };
    VtsUsers.remoteMethod(
        'updateProfilePic',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/UpdateProfilePic',verb:'post'}
        }
    );  
    VtsUsers.userDetails = function(req,res,next){
		customLib.validateCookies(req,function(validated,user){
			if(validated){
                var user = JSON.parse(user);
                var userID = user.userId;
                var userType = user.vtsLogin.userType;
				VtsUsers.find({where:{'userId':userID},'include':['vtsLogin']},function(err,instance){
					if(instance.length!=0){
						result.userType = userType;
						result.responseData = instance;
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
    VtsUsers.remoteMethod(
        'userDetails',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/bUserDetails',verb:'get'}
        }
    );

    VtsUsers.getUsersOfCompany = function(req,res,next){
		customLib.validateCookies(req,function(validated,user){
			if(validated){
                var user = JSON.parse(user);
                var userID = user.userId;
                var userType = user.vtsLogin.userType;
                var companyId = user.vtsLogin.companyId;
				app.models.VtsLogin.find({where:{'and':[{'companyId':companyId},{'userId':{'neq':companyId}}]},'include':['vtsUsers']},function(err,instance){
					if(instance.length!=0){
						result.userType = userType;
						result.responseData = instance;
						result.returnStatus = "SUCCESS";
						res.send(result);
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
    VtsUsers.remoteMethod(
        'getUsersOfCompany',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/GetCompanyUsers',verb:'get'}
        }
    );

    VtsUsers.getAllCompanies = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userID = user.userId;
                var userType = user.vtsLogin.userType;
                app.models.VtsLogin.find({where:{'userType':"COMPANY"},'include':['vtsUsers']},function(err,instance){
                    if(instance.length!=0){
                        result.userType = userType;
                        result.responseData = instance;
                        result.returnStatus = "SUCCESS";
                        res.send(result);
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
    VtsUsers.remoteMethod(
        'getAllCompanies',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/GetAllCompanies',verb:'get'}
        }
    );

    VtsUsers.inActivateUser = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userID = user.userId;
                var userType = user.vtsLogin.userType;
                var companyId = user.vtsLogin.companyId;

                app.models.VtsLogin.findById(req.query.userId,function(err,instance){
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
                        var login = {};
                        login.accountActive = 'N';
                        instance.updateAttributes(login,function(err,obj){
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
    VtsUsers.remoteMethod(
        'inActivateUser',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/InActivateUser',verb:'get'}
        }
    );

    VtsUsers.activateUser = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userID = user.userId;
                var userType = user.vtsLogin.userType;
                var companyId = user.vtsLogin.companyId;

                app.models.VtsLogin.findById(req.query.userId,function(err,instance){
                    if(err){
                        result = {};
                        result.returnStatus="ERROR";
                        res.send(result);
                    }else if(instance == null){
                        result = {};
                        result.returnStatus="EMPTY";
                        res.send(result);
                    }else{
                        var login = {};
                        login.accountActive = 'Y';
                        instance.updateAttributes(login,function(err,obj){
                            if(err){
                                result = {};
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
    VtsUsers.remoteMethod(
        'activateUser',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/ActivateUser',verb:'get'}
        }
    );

    VtsUsers.createCustomer = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
			if(validated){
                var user = JSON.parse(user);
                var userID = user.userId;
                var userType = user.vtsLogin.userType;
                var userLoginName = user.vtsLogin.userName;
                var companyId = user.vtsLogin.companyId;

                var login = {};
                var details = {};
                var object = req.body;
                //console.log('obj is '+JSON.stringify(object));
                
                if(object.username != null || object.userInformation != null || object.username != undefined || object.userInformation != undefined  ){
	                login.userName = object.username;
	                var password = crypto.createHash('sha1').update(object.userInformation).digest('Hex');
	                login.userInformation = password;
                    if(userType == "COMPANY")
	                   login.userType = "USER";
                   else if(userType == "ADMIN")
                        login.userType = "COMPANY";
	                login.companyId = userID;
	            }else{
	            	result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
	            }
                
                
	            if(object.name != null || object.name != undefined ){
                	details.name = object.name;
                }else{
	            	result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
	            }
                if(object.emailId != null || object.emailId != undefined ){
                	details.emailId = object.emailId;
                }else{
	            	result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
	            }
                if(object.mobileNumber != null || object.mobileNumber != undefined ){
                	details.mobileNumber = object.mobileNumber;
                }else{
	            	result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
	            }
                if(object.address != null || object.address != undefined )
                	details.address = object.address;
                else
                	details.address = object.address;

                app.models.VtsLogin.count({'userName':login.userName},function(err,count){
                    if(err){
                        result = {}
                        result.reason = 'Login id '+login.userName+' already exists. Change email id.';
                        result.returnStatus = "DUPLOGINID";
                        res.send(result);
                        return;
                    }else if(count!=0){
                        result = {}
                        result.reason = 'Login id '+login.userName+' already exists. Change email id.';
                        result.returnStatus = "DUPLOGINID";
                        res.send(result);
                        return;
                    }else{
                        console.log('Creating user for login '+JSON.stringify(login));
                        app.models.VtsLogin.create(login,function(err,obj){
                            if(err){
                                result = {}
                                console.log('Error is '+err);
                                result.returnStatus = "ERROR";
                                res.send(result);
                            }else if(obj == null){
                                result = {}
                                result.returnStatus = "ERROR";
                                res.send(result);
                                return;
                            }else{ 
                                details.userId = obj.userId;

                                if(userType == "ADMIN"){
                                   var temp = {};
                                    temp.companyId = obj.userId;
                                    obj.updateAttributes(temp,function(err,obj){
                                        if(err){
                                            result = {};
                                            result.returnStatus="ERROR";
                                            res.send(result);
                                        }else if(obj == null){
                                            result = {};
                                            result.returnStatus="ERROR";
                                            res.send(result);
                                        }
                                    }); 
                                }
                                VtsUsers.create(details,function(err,obj){
                                    if(err){
                                        result = {}
                                        result.returnStatus = "ERROR";
                                        app.models.Login.destroyById(details.userId,function(err){
                                        });
                                        res.send(result);
                                    }else if(obj == null){
                                        result = {}
                                        result.returnStatus = "ERROR";
                                        app.models.Login.destroyById(details.userId,function(err){
                                        });
                                        VtsUsers.destroyById(details.userId,function(err){
                                        });
                                        res.send(result);
                                    }else{
                                        result = {}
                                        result.returnStatus = "SUCCESS";
                                        res.send(result);
                                    }
                                });
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
    VtsUsers.remoteMethod(
        'createCustomer',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/CreateCustomer',verb:'post'}
        }
    );


    VtsUsers.updateCustomer = function(req,res,next){
        customLib.validateCookies(req,function(validated,user){
            if(validated){
                var user = JSON.parse(user);
                var userID = user.userId;
                var userType = user.vtsLogin.userType;
                var userLoginName = user.vtsLogin.userName;
                var companyId = user.vtsLogin.companyId;

                var login = {};
                var details = {};
                var object = req.body;
                var userInformation = object.userInformation;
                //console.log('obj is '+JSON.stringify(object));
                
                if(object.username != null || object.userInformation != null || object.username != undefined || object.userInformation != undefined  ){
                    login.userId = object.userId;
                    details.userId = object.userId;
                    var password = crypto.createHash('sha1').update(object.userInformation).digest('Hex');
                    login.userInformation = password;

                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                
                
                if(object.name != null || object.name != undefined ){
                    details.name = object.name;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.emailId != null || object.emailId != undefined ){
                    details.emailId = object.emailId;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.mobileNumber != null || object.mobileNumber != undefined ){
                    details.mobileNumber = object.mobileNumber;
                }else{
                    result = {}
                    result.returnStatus = "ERROR";
                    res.send(result);
                    return;
                }
                if(object.address != null || object.address != undefined )
                    details.address = object.address;
                else
                    details.address = object.address;

                app.models.VtsLogin.findById(login.userId,function(err,obj){
                    if(err){
                        result = {}
                        console.log('Error is '+err);
                        result.returnStatus = "ERROR";
                        res.send(result);
                    }else if(obj == null){
                        result = {}
                        result.returnStatus = "ERROR";
                        res.send(result);
                        return;
                    }else{ 
                        if(obj.userInformation == userInformation)
                            login={};
                        obj.updateAttributes(login,function(err,instance){
                            if(err){
                                result = {}
                                result.returnStatus = "ERROR";
                                res.send(result);
                            }else if(instance == null){
                                result = {}
                                result.returnStatus = "ERROR";
                                res.send(result);
                            }else{
                                app.models.VtsUsers.findById(details.userId,function(err,obj){
                                    if(err){
                                        result = {};
                                        result.returnStatus = "ERROR";
                                        res.send(result);
                                    }else if(obj == null){
                                        result = {}
                                        result.returnStatus = "ERROR";
                                        res.send(result);
                                        return;
                                    }else{ 
                                        obj.updateAttributes(details,function(err,instance){
                                            if(err){
                                                result = {}
                                                result.returnStatus = "ERROR";
                                                res.send(result);
                                            }else if(instance == null){
                                                result = {}
                                                result.returnStatus = "ERROR";
                                                res.send(result);
                                            }else{
                                                result = {}
                                                result.returnStatus = "SUCCESS";
                                                res.send(result);
                                            }
                                        });
                                    }
                                });
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
    VtsUsers.remoteMethod(
        'updateCustomer',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/UpdateCustomer',verb:'post'}
        }
    );
 };