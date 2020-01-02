module.exports = serveindex;
var customeLib = require('../customlib.js');
var path = require('path');
function serveindex(){
  return function(req, res){
      customeLib.validateCookies(req,function(validated,user){
          console.log("validated and user is " + validated + user);
      	  if(validated){
      	      var user = JSON.parse(user);
      	      res.sendFile(path.resolve('../client/userhome.html'));
      		}else{
      			   res.sendFile(path.resolve('../client/login.html'));
      		}
      });
  }
}
