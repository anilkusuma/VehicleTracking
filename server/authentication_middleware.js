module.export = function(options){
	return function(req,res,next){
		    var customLib = require('./customlib.js');
    		var app = require('./server.js');	
			var result = {};
			console.log(req.query.s+' '+req.query.v);
			var VtsValidator = app.models.VtsValidator;
			VtsValidator.find({where:{'and':[{'validator':req.query.v},{'selector':req.query.s}]},include:'vtsUsers'},function(err,instance){
				if(instance.length!=0){
					result = instance[0].toJSON();
					res.redirect('/login');
				}else{
					result.loginStatus="FAILURE";
					result.failureReason="COMBINATIONDOESNOTEXIST";
					res.send(result);
				}
			});
	}
}