module.exports = function(VtsValidator) {
    var customLib = require('../../server/customlib.js');
    var app = require('../../server/server.js');
   
    VtsValidator.validate = function(req,res,next){
        var result = {};
        console.log(req.query.s+' '+req.query.v);
        VtsValidator.find({where:{'and':[{'validator':req.query.v},{'selector':req.query.s}]},include:'vtsUsers'},function(err,instance){
            console.log(instance);
            if(instance.length!=0){
                result = instance[0].toJSON();
                result.loginStatus = "SUCCESS";
                console.log(result);
                res.send(result);
            }else{
                result.loginStatus="FAILURE";
                result.failureReason="COMBINATIONDOESNOTEXIST";
                res.send(result);
            }
        });
    };
    
    VtsValidator.remoteMethod(
        'validate',
        {
            isStatice:true,
            accepts:[
                { arg:'req' ,type:'object','http':{source:'req'}},
                { arg:'res' ,type:'object','http':{source:'res'}},
            ],
            http:{path:'/validate',verb:'get'}
        }
    ); 
 
 };