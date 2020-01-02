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
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://CurveCube:anilkusuma@13.234.151.209:7001');
var dataStore = require('./dataStore.js');

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

        client.on('connect', () => {
            client.subscribe('CurveCube/VehicleTracking/Packets');
        });

        client.on('message', (topic, packetString) => {
            try{
                var packet = JSON.parse(packetString);
                packet.deviceImei = packet.imei;
                packet.noOfSat = packet.numberOfSatilites;
                packet.packetTime = packet.time;
                packet.packetSerialNumber = packet.serialNumber;
                dataStore.processReceivedPacket(JSON.stringify(packet), function(status) {
                    if(status){
                        //console.log('customlib packet processed success.');
                    }else{
                        console.log('Could not save packet processing failed.' + packetString);
                    }
                });
            }catch(e){
                console.log('Error converting packetString '+ packetString);
                return;
            }
        });
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
    }
};
boot(app, __dirname, function(err) {
  if (err) throw err
  if (require.main === module) {
      app.start();
  }
});
