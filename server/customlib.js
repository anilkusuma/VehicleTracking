module.exports.isEmptyObject = function(obj) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          return false;
        }
      }
      return true;   
 };
module.exports.getRandom = function(length) {
    return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1)); 
};

module.exports.validateCookies = function(req,callback){
	var app = require('./server.js');
	var customLib = require('./customlib.js');
    if(req.query.validator != undefined && req.query.selector != undefined && req.query.userId != undefined){
        app.models.Validator.find({where:{'and':[{'validator':req.query.validator},{'selector':req.query.selector}]},include:'login'},function(err,instance){                   
            if(instance.length !== 0){
                if(instance[0].userId == req.query.userId){
                    callback(true,JSON.stringify(instance[0]));
                 }else{
                    callback(false,null);
                 }
            }
            else{
                callback(false,null);
            }
        });
    }else if(!customLib.isEmptyObject(req.headers.cookie)){
    	var lists = req.headers.cookie.split("; ");
        var cookies = {};
        for(i=0;i<lists.length;i++){
        	var c = lists[i].split("=");
            if(c.length>=2)
            	cookies[c[0]] = c[1];
		}
		app.models.VtsValidator.find({where:{'and':[{'validator':cookies.validator},{'selector':cookies.selector}]},include:['vtsUsers','vtsLogin']},function(err,instance){       			
			if(instance.length !== 0){
                if(instance[0].userId == cookies.userID){
				    callback(true,JSON.stringify(instance[0]));
			     }else{
				    callback(false,null);
			     }
            }
            else{
                callback(false,null);
            }
 		});
	}else{
		callback(false,null);
	}
};
module.exports.validateUsername = function(userName,callback){
    var app = require('./server.js');
    var customLib = require('./customlib.js');
    app.models.VtsLogin.find({where:{'userName':userName}},function(err,instance){                   
        if(instance.length !== 0){
            callback(false);
        }
        else{
            callback(true);
        }
    });
};
module.exports.getFromFileAndStore = function(){
    var app = require('./server.js');
    var fs = require('fs');
    var path = require('path');
    var customLib = require('./customlib.js');

    fs.readFile(path.resolve('./packetData.txt'),'utf8',function(err, data){
        if (err) throw err;
        fs.truncate(path.resolve('./packetData.txt'),0,function(err){
        });
        //console.log('data length is '+data.length);
        customLib.processFileData(data,function(status){
            setTimeout(customLib.getFromFileAndStore,500);
        });
    });
};
module.exports.processFileData = function(data,callback){
    var app = require('./server.js');
    var dataStore = require('./dataStore.js');
    var packetConfig = require('./packetConfigurations.js');
    var customLib = require('./customlib.js');
    var count =0;
    var dataToStore= '';
    var i=0;
    var ch='';
    var valid = false;
    var packetString = '';
    (function processOnePacket(){
        if(i>=data.length){
            callback("COMPLETE");
            return;
        }else{
            valid = false;
            ch = '';
            count = 0;
            dataToStore = '';
            packetString = '';
            while(i<data.length){
                ch = data[i];
                i=i+1;
                if(count == 0){
                   if(ch == '*'){
                       count = count+1;
                       dataToStore = '';
                       continue;
                    }else {
                        count = 0;
                        dataToStore = '';
                        continue;
                    }
                }else if(count == 1){
                    if(ch != '*' && ch != '#'){
                        dataToStore = dataToStore+ch;
                        continue;
                    }else if(ch == '#'){
                        dataToStore = dataToStore;
                        count = 0;
                        packetString = dataToStore;
                        dataToStore = '';
                        valid = true;
                        break;
                    }else if(ch == '*'){
                        dataToStore = '';
                        count = 0;
                        continue;
                    }
                }
            }
            if(valid){
                dataStore.processReceivedPacket(packetString,function(status){
                    if(status){
                        console.log('customlib packet processed success.');
                    }else{
                        console.log('customlib packet processing failed.');
                    }
                    setTimeout(processOnePacket,0);
                });
            }else{
                setTimeout(processOnePacket,0);
            }
        }   
    })();
};
module.exports.generateIdForGeoFence = function(callback){
    var customLib = require('./customlib.js');
    var app = require('./server.js');
    var fenceId;
    var status = true;
    app.models.VtsGeoFencing.find({'fields':{'geoFenceId':true}},function(err,instance){
        if(instance.length != 0){
            fenceId = customLib.getRandom(8);
            callback(fenceId);
        }else{
            while(1){
                var status = true;
                fenceId = customLib.getRandom(8);
                for(var i=0;i<instance.length;i++){
                    if(fenceId == instance[i].geoFenceId){
                        status = false;
                    }
                }
                if(status){
                    callback(fenceId);
                    break;
                }
            }
        }
    });
};
module.exports.distanceBwLatLng = function(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = (parseFloat(lat2)-parseFloat(lat1))*(Math.PI/180);  // deg2rad below
    var dLon = (parseFloat(lon2)-parseFloat(lon1))*(Math.PI/180); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +Math.cos(parseFloat(lat1)* (Math.PI/180)) * Math.cos(parseFloat(lat2)* (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}
module.exports.convertDateTime = function(dateString,timezone){
    var moment = require('moment-timezone');
    var year = parseInt(dateString.substring(0,2),16).toString();
    var month = parseInt(dateString.substring(2,4),16).toString();
    var day = parseInt(dateString.substring(4,6),16).toString();
    var hour = parseInt(dateString.substring(6,8),16).toString();
    var minute = parseInt(dateString.substring(8,10),16).toString();
    var second = parseInt(dateString.substring(10,12),16).toString();
    var year = "20"+year;
    var totalTime = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;
    console.log('receivedTime is '+totalTime);
    //totalTime = moment.tz(totalTime,'YYYY-M-D H:m:s','Hongkong').tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss');
    totalTime = moment(totalTime,'YYYY-M-D H:m:s').utcOffset(timezone,true);
    console.log('timeZone time is '+totalTime);
    totalTime = totalTime.tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss');
    console.log('localTime is '+totalTime);
    return totalTime;
}

module.exports.convertLatOrLong = function(latLong){
    var hexLatLong = parseInt(latLong,16);
    var floatLatLong = parseFloat(hexLatLong)/parseFloat(30000);
    var latlng = parseFloat(floatLatLong)/parseFloat(60);
    console.log('latLong is '+latlng);
    return latlng;
};
module.exports.convertCource = function(state,cource){
    var hexState = parseInt(state,16);
    var hexCource = parseInt(cource,16);
    var binaryState = ("00000000"+hexState.toString(2)).substr(-8);
    var binaryCource = ("00000000"+hexState.toString(2)).substr(-8);
    var completeCource = binaryState+binaryCource;
    completeCource = completeCource.substring(6,16);
    completeCource = parseInt(completeCource,2);
    console.log('cource is '+completeCource);
    return completeCource;
};
module.exports.convertTimeZone = function(timezoneinfo){
    console.log('timezone is '+timezoneinfo.substring(0,3));
    var timezone = parseInt(timezoneinfo.substring(0,3),16).toString();
    console.log('timezone is '+timezone);
    while(timezone.length < 4){
        timezone = '0'+timezone;
    }
    timezone = timezone.substring(0,2)+':'+timezone.substring(2,timezone.length);
    var zone = timezoneinfo.substring(3,4);
    zone = parseInt(zone,16);
    if(zone >= 8){
        timezone = '-'+timezone;
    }else{
        timezone = '\+'+timezone;
    }
    console.log('timezone is '+timezone);
    return timezone;
};
module.exports.convertTerminalInformation = function(info){
    info = parseInt(info,16);
    info = ("00000000"+info.toString(2)).substr(-8);
    var returnInfo = {};
    if(info.substring(0,1) == '1'){
        returnInfo.oeStatus = 'Y';
    }else if(info.substring(0,1) == '0'){
        returnInfo.oeStatus = 'N';
    }
    if(info.substring(1,2) == '1'){
        returnInfo.gpsStatus = 'Y';
    }else if(info.substring(1,2) == '0'){
        returnInfo.gpsStatus = 'N';
    }
    if(info.substring(5,6) == '1'){
        returnInfo.chargeStatus = 'Y';
    }else if(info.substring(5,6) == '0'){
        returnInfo.chargeStatus = 'N';
    }
    if(info.substring(7,8) == '1'){
        returnInfo.accStatus = 'Y';
    }else if(info.substring(7,8) == '0'){
        returnInfo.accStatus = 'N';
    }
    if(info.substring(2,5) == '000'){
        returnInfo.alaramStatus = 'NORMAL';
    }else if(info.substring(2,5) == '001'){
        returnInfo.alaramStatus = 'SHOCK';
    }else if(info.substring(2,5) == '010'){
        returnInfo.alaramStatus = 'POWERCUT';
    }else if(info.substring(2,5) == '011'){
        returnInfo.alaramStatus = 'LOWBATTERY';
    }else if(info.substring(2,5) == '100'){
        returnInfo.alaramStatus = 'SOS';
    }
    return returnInfo;
};
module.exports.checkCRC = function(buf){
    var crcTable = 
    [
        0X0000, 0X1189, 0X2312, 0X329B, 0X4624, 0X57AD, 0X6536, 0X74BF, 0X8C48, 0X9DC1, 0XAF5A, 
        0XBED3, 0XCA6C, 0XDBE5, 0XE97E, 0XF8F7, 0X1081, 0X0108, 0X3393, 0X221A, 0X56A5, 0X472C, 
        0X75B7, 0X643E, 0X9CC9, 0X8D40, 0XBFDB, 0XAE52, 0XDAED, 0XCB64, 0XF9FF, 0XE876, 0X2102, 
        0X308B, 0X0210, 0X1399, 0X6726, 0X76AF, 0X4434, 0X55BD, 0XAD4A, 0XBCC3, 0X8E58, 0X9FD1, 
        0XEB6E, 0XFAE7, 0XC87C, 0XD9F5, 0X3183, 0X200A, 0X1291, 0X0318, 0X77A7, 0X662E, 0X54B5, 
        0X453C, 0XBDCB, 0XAC42, 0X9ED9, 0X8F50, 0XFBEF, 0XEA66, 0XD8FD, 0XC974, 0X4204, 0X538D, 
        0X6116, 0X709F, 0X0420, 0X15A9, 0X2732, 0X36BB, 0XCE4C, 0XDFC5, 0XED5E, 0XFCD7, 0X8868, 
        0X99E1, 0XAB7A, 0XBAF3, 0X5285, 0X430C, 0X7197, 0X601E, 0X14A1, 0X0528, 0X37B3, 0X263A, 
        0XDECD, 0XCF44, 0XFDDF, 0XEC56, 0X98E9, 0X8960, 0XBBFB, 0XAA72, 0X6306, 0X728F, 0X4014, 
        0X519D, 0X2522, 0X34AB, 0X0630, 0X17B9, 0XEF4E, 0XFEC7, 0XCC5C, 0XDDD5, 0XA96A, 0XB8E3, 
        0X8A78, 0X9BF1, 0X7387, 0X620E, 0X5095, 0X411C, 0X35A3, 0X242A, 0X16B1, 0X0738, 0XFFCF, 
        0XEE46, 0XDCDD, 0XCD54, 0XB9EB, 0XA862, 0X9AF9, 0X8B70, 0X8408, 0X9581, 0XA71A, 0XB693, 
        0XC22C, 0XD3A5, 0XE13E, 0XF0B7, 0X0840, 0X19C9, 0X2B52, 0X3ADB, 0X4E64, 0X5FED, 0X6D76, 
        0X7CFF, 0X9489, 0X8500, 0XB79B, 0XA612, 0XD2AD, 0XC324, 0XF1BF, 0XE036, 0X18C1, 0X0948, 
        0X3BD3, 0X2A5A, 0X5EE5, 0X4F6C, 0X7DF7, 0X6C7E, 0XA50A, 0XB483, 0X8618, 0X9791, 0XE32E, 
        0XF2A7, 0XC03C, 0XD1B5, 0X2942, 0X38CB, 0X0A50, 0X1BD9, 0X6F66, 0X7EEF, 0X4C74, 0X5DFD, 
        0XB58B, 0XA402, 0X9699, 0X8710, 0XF3AF, 0XE226, 0XD0BD, 0XC134, 0X39C3, 0X284A, 0X1AD1, 
        0X0B58, 0X7FE7, 0X6E6E, 0X5CF5, 0X4D7C, 0XC60C, 0XD785, 0XE51E, 0XF497, 0X8028, 0X91A1, 
        0XA33A, 0XB2B3, 0X4A44, 0X5BCD, 0X6956, 0X78DF, 0X0C60, 0X1DE9, 0X2F72, 0X3EFB, 0XD68D, 
        0XC704, 0XF59F, 0XE416, 0X90A9, 0X8120, 0XB3BB, 0XA232, 0X5AC5, 0X4B4C, 0X79D7, 0X685E, 
        0X1CE1, 0X0D68, 0X3FF3, 0X2E7A, 0XE70E, 0XF687, 0XC41C, 0XD595, 0XA12A, 0XB0A3, 0X8238, 
        0X93B1, 0X6B46, 0X7ACF, 0X4854, 0X59DD, 0X2D62, 0X3CEB, 0X0E70, 0X1FF9, 0XF78F, 0XE606, 
        0XD49D, 0XC514, 0XB1AB, 0XA022, 0X92B9, 0X8330, 0X7BC7, 0X6A4E, 0X58D5, 0X495C, 0X3DE3, 
        0X2C6A, 0X1EF1, 0X0F78,
    ];


    crcX = parseInt("ffff",16);
    cr1 = parseInt("ff",16);
    cr2 = parseInt("ffff",16);
    i = 0;

    while(i < buf.length)
    {
        str = buf.substring(i,i+2);
        str_hex = parseInt(str,16);

        j = (crcX ^ str_hex) & cr1;
        crcX = (crcX >> 8) ^ crcTable[j] ;

        i = i + 2;
    }

    crcX = crcX ^ 0x0ffff;
    crcX=crcX.toString(16);
    while(crcX.length < 4)
        crcX = "0"+crcX;
    return crcX;
};
