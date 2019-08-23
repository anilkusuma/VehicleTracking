var loopback = require('loopback');
var boot = require('loopback-boot');
var cookieParser = require('cookie-parser');
var cluster = require('cluster');
var https = require('https');
var net = require('net');
var app = module.exports = loopback();
var httpServer,tcpServer;
var path = require('path');
var customLib = require('./customlib.js');
var fs = require('fs');
var packetConfig = require('./packetConfigurations.js');
var dataStore = require('./dataStore.js');
var moment = require('moment-timezone');
var workers = [];
app.start = function() {
    if(cluster.isMaster) {
        var numWorkers = require('os').cpus().length;
        console.log('Master cluster setting up ' + numWorkers + ' workers...');
        for(var i = 0; i < numWorkers; i++) {
            workers[i]=cluster.fork();
        }
        cluster.on('online', function(worker) {
            console.log('Worker ' + worker.process.pid + ' is online');
        });
        cluster.on('exit', function(worker, code, signal) {
            console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
            console.log('Starting a new worker');
            cluster.fork();
        });
        customLib.getFromFileAndStore();
        //customLib.simulateTestFromMysql();
    } else if(cluster.isWorker) {
        app.listen(function() {
            app.emit('started');
            // var tempTimeZone = customLib.convertTimeZone('0001');
            // customLib.convertDateTime('110c0b102603',tempTimeZone);
            var baseUrl = app.get('url').replace(/\/$/, '');
            if (app.get('loopback-component-explorer')) {
                var explorerPath = app.get('loopback-component-explorer').mountPath;
            }
        });
        tcpServer = net.createServer();
        tcpServer.listen({host:'0.0.0.0',port:7826},function(){
            console.log('Server listening on ' + tcpServer.address().address +':'+ tcpServer.address().port);
        });
        tcpServer.on('connection', function(sock) {
            console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
            sock.setEncoding('hex');
            var loginStatus = false;
            var timeZone = '+00:00';
            var deviceImei = '';
            var dataString='';
            var startPattern = "7878";
            var endPattern = "0d0a";
            sock.on('data',function(data){
                dataString = dataString+data.toString();
                while(1){
                    if((dataString.indexOf("7878") == -1) || (dataString.indexOf("0d0a") == -1)){
                        break;
                    }else{
                        var packet = dataString.substring(dataString.indexOf("7878")+4,dataString.indexOf("0d0a"));
                        var packetType = packet.substring(2,4);
                        var packetLength = packet.substring(0,2);
                        console.log('packet is '+packet+' \n pakcetType is '+packetType+'\n');
                        if(!loginStatus){
                            if(packetType == "01"){
                                if(customLib.checkCRC(packet.substring(0,packet.length-4)) == packet.substring(packet.length-4,packet.length)){
                                    deviceImei = packet.substring(5,20);
                                    loginStatus = true;
                                    var login = {};
                                    if(packetLength == "11"){
                                        timeZone = customLib.convertTimeZone(packet.substring(24,28));
                                    }else{
                                        timeZone = "+08:00";
                                    }
                                    login.deviceImei = deviceImei;
                                    login.packetSerialNumber = parseInt(packet.substring(packet.length-8,packet.length-4),16).toString();
                                    login.packetType = packetType;
                                    var fileAppendString = '*'+JSON.stringify(login)+'#';
                                    fs.appendFileSync(path.resolve('./packetData.txt'),fileAppendString);
                                    app.models.Packets.create(login,function(err,obj){
                                        if(err)
                                            console.log(err);
                                    });
                                    var login_response = startPattern+"0501"+packet.substring(packet.length-8,packet.length-4)+customLib.checkCRC("0501"+packet.substring(packet.length-8,packet.length-4))+endPattern;
                                    sock.write(login_response,'hex');
                                }else{
                                    sock.end();
                                }
                            }else{
                                sock.end();
                            }
                        }else{
                            if(packetType == "01"){
                                if(deviceImei == packet.substring(5,20)){
                                    if(customLib.checkCRC(packet.substring(0,packet.length-4)) == packet.substring(packet.length-4,packet.length)){
                                        loginStatus = true;
                                        var login = {};
                                        if(packetLength == "11"){
                                            timeZone = customLib.convertTimeZone(packet.substring(24,28));
                                        }else{
                                            timeZone = "+08:00";
                                        }
                                        deviceImei = packet.substring(5,20);
                                        login.deviceImei = deviceImei;
                                        login.packetSerialNumber = parseInt(packet.substring(packet.length-8,packet.length-4),16).toString();
                                        login.packetType = packetType;
                                        var fileAppendString = '*'+JSON.stringify(login)+'#';
                                        fs.appendFileSync(path.resolve('./packetData.txt'),fileAppendString);

                                        app.models.Packets.create(login,function(err,obj){
                                            if(err)
                                                console.log(err);
                                        });
                                        var login_response = startPattern+"0501"+packet.substring(packet.length-8,packet.length-4)+customLib.checkCRC("0501"+packet.substring(packet.length-8,packet.length-4))+endPattern;
                                        sock.write(login_response,'hex');
                                    }else{
                                        sock.end();
                                    }
                                }else{
                                    sock.end();
                                }
                            }else if(packetType == "12" || packetType == "22"){
                                if(customLib.checkCRC(packet.substring(0,packet.length-4)) == packet.substring((packet.length-4),packet.length)){
                                    console.log('location packet is : '+packet);
                                    var location = {};

                                    location.deviceImei = deviceImei;
                                    location.packetType = packetType;
                                    location.timeZone = timeZone;
                                    location.packetTime = customLib.convertDateTime(packet.substring(4,16),timeZone);
                                    location.noOfSat = parseInt(packet.substring(17,18),16).toString();
                                    location.latitude = customLib.convertLatOrLong(packet.substring(18,26));
                                    location.longitude =customLib.convertLatOrLong(packet.substring(26,34));;
                                    location.speed= parseInt(packet.substring(34,36),16).toString();;
                                    location.direction = customLib.convertCource(packet.substring(36,38),packet.substring(38,40));
                                    location.packetSerialNumber = parseInt(packet.substring(packet.length-8,packet.length-4),16).toString();
                                    location.alertId = null;

                                    app.models.Packets.create(location,function(err,obj){
                                        if(err)
                                            console.log(err);
                                    });
                                    var fileAppendString = '*'+JSON.stringify(location)+'#';
                                    fs.appendFileSync(path.resolve('./packetData.txt'),fileAppendString);
                                }else{
                                    sock.end();
                                }
                            }else if(packetType == "13" ){
                                if(customLib.checkCRC(packet.substring(0,packet.length-4)) == packet.substring((packet.length-4),packet.length)){
                                    var heartbeat = {};
                                    heartbeat.packetTime = moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss');
                                    heartbeat.deviceImei = deviceImei;
                                    heartbeat.packetType = packetType;
                                    heartbeat.packetSerialNumber = parseInt(packet.substring(packet.length-8,packet.length-4),16).toString();
                                    var returnInfo = customLib.convertTerminalInformation(packet.substring(4,6));
                                    heartbeat.oeStatus = returnInfo.oeStatus;
                                    heartbeat.alaramStatus = returnInfo.alaramStatus;
                                    heartbeat.chargeStatus = returnInfo.chargeStatus;
                                    heartbeat.accStatus = returnInfo.accStatus;
                                    heartbeat.activeStatus = returnInfo.gpsStatus;
                                    heartbeat.gpsStatus = returnInfo.gpsStatus;
                                    heartbeat.voltageLevel =parseInt(packet.substring(6,8),16).toString();
                                    heartbeat.gsmSignalStrength = parseInt(packet.substring(8,10),16).toString();

                                    app.models.Packets.create(heartbeat,function(err,obj){
                                        if(err)
                                            console.log(err);
                                    });
                                    var fileAppendString = '*'+JSON.stringify(heartbeat)+'#';
                                    fs.appendFileSync(path.resolve('./packetData.txt'),fileAppendString);
                                    var heart_response = startPattern+"0513"+packet.substring(packet.length-8,packet.length-4)+customLib.checkCRC("0513"+packet.substring(packet.length-8,packet.length-4))+endPattern;
                                    sock.write(heart_response,'hex');
                                }else{
                                    sock.end();
                                }
                            }else if(packetType == "16" || packetType == "26" || packetType == "27"){
                                if(customLib.checkCRC(packet.substring(0,packet.length-4)) == packet.substring((packet.length-4),packet.length)){
                                    console.log('alaram packet is '+packet);
                                    var alaram = {};
                                    alaram.packetType = packetType;
                                    alaram.deviceImei = deviceImei;
                                    alaram.packetTime = customLib.convertDateTime(packet.substring(4,16),timeZone);
                                    alaram.packetSerialNumber = parseInt(packet.substring(packet.length-8,packet.length-4),16).toString();

                                    alaram.location = {};
                                    alaram.location.deviceImei = deviceImei;
                                    alaram.location.timeZone = timeZone;
                                    alaram.location.packetTime = customLib.convertDateTime(packet.substring(4,16),timeZone);
                                    alaram.location.noOfSat = parseInt(packet.substring(17,18),16).toString();
                                    alaram.location.latitude = customLib.convertLatOrLong(packet.substring(18,26));
                                    alaram.location.longitude =customLib.convertLatOrLong(packet.substring(26,34));
                                    alaram.location.speed= parseInt(packet.substring(34,36),16).toString();
                                    alaram.location.direction =  customLib.convertCource(packet.substring(36,38),packet.substring(38,40));
                                    alaram.location.alertId = null;

                                    alaram.alaramStatus= {};
                                    var returnInfo = customLib.convertTerminalInformation(packet.substring(58,60));
                                    alaram.alaramStatus.oeStatus = returnInfo.oeStatus;
                                    alaram.alaramStatus.alaramStatus = returnInfo.alaramStatus;
                                    alaram.alaramStatus.chargeStatus = returnInfo.chargeStatus;
                                    alaram.alaramStatus.accStatus = returnInfo.accStatus;
                                    alaram.alaramStatus.activeStatus = returnInfo.gpsStatus;
                                    alaram.alaramStatus.gpsStatus = returnInfo.gpsStatus;
                                    alaram.alaramStatus.voltageLevel =parseInt(packet.substring(60,62),16).toString();
                                    alaram.alaramStatus.gsmSignalStrength = parseInt(packet.substring(62,64),16).toString();
                                    var fileAppendString = '*'+JSON.stringify(alaram)+'#';
                                    fs.appendFileSync(path.resolve('./packetData.txt'),fileAppendString);
                                    app.models.Packets.create(alaram,function(err,obj){
                                        if(err)
                                            console.log(err);
                                    });
                                    var alert_response = startPattern+"0516"+packet.substring(packet.length-8,packet.length-4)+customLib.checkCRC("0516"+packet.substring(packet.length-8,packet.length-4))+endPattern;
                                    sock.write(alert_response,'hex');
                                }else{
                                    sock.end();
                                }
                            }
                        }
                        dataString = dataString.slice(dataString.indexOf("0d0a")+4);
                    }
                }
            });     
        });
        tcpServer_BSTPL = net.createServer();
        tcpServer_BSTPL.listen({host:'0.0.0.0', port:7836}, function(){
            console.log('Server BSTPL listening on ' + tcpServer_BSTPL.address().address +':'+ tcpServer_BSTPL.address().port);
        });
        tcpServer_BSTPL.on('connection', function(sock) {
            console.log("Connection received for DeviceType BSTPL "+ sock.remoteAddress +':'+ sock.remotePort);
            sock.on('data', function(data) {
                console.log(' Received data from BSTPL device  ' + data);
                var deviceImei = '';
                var dataString='';
                var timeZone = '+05:30';
                var startPattern = "GTPL $1";
                var endPattern = "#";

                dataString = dataString+data.toString();
                while(1) {
                    if((dataString.indexOf(startPattern) == -1) || (dataString.indexOf(endPattern) == -1)){
                        break;
                    }else{
                        var packet = dataString.substring(dataString.indexOf(startPattern), dataString.indexOf(endPattern));
                        packet = packet.split(',');
                        if(packet[2] == "A") {
                            console.log('location packet from BSTPL is : '+ packet.toString());
                            var location = {};

                            location.deviceImei = packet[1];
                            location.packetType = '$1';
                            location.timeZone = timeZone;
                            var date = packet[3].substring(4,6)+'-'+packet[3].substring(2,4)+'-'+packet[3].substring(0,2);
                            var time = packet[4].substring(0,2) + ':' + packet[4].substring(2,4) + ':' + packet[4].substring(4,6);
                            location.packetTime = date+ ' '+time;
                            console.log(" Odomoter of vehicle "+location.deviceImei+" is "+packet[10]);
                            location.odometer = packet[10];
                            location.noOfSat = packet[12];
                            location.latitude = packet[5];
                            location.longitude = packet[7];
                            location.speed= packet[9];
                            location.direction = packet[11];
                            location.packetSerialNumber = 0;
                            location.alertId = null;

                            app.models.Packets.create(location, function(err,obj){
                                if(err)
                                    console.log(err);
                            });
                            var fileAppendString = '*'+JSON.stringify(location)+'#';
                            fs.appendFileSync(path.resolve('./packetData.txt'),fileAppendString);
                        }
                        dataString = dataString.slice(dataString.indexOf(endPattern)+1);
                    }
                }
            });
        });
    }   
};
boot(app, __dirname, function(err) {
  if (err) throw err
  if (require.main === module) {
      app.start();
  }
});
