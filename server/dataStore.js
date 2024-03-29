module.exports = {
    saveGpsPacket : function(gpsPacket,callback){
        var app = require('./server.js');
        var customLib = require('./customlib.js');
        var moment = require('moment');
        var deviceGps = {
                            "deviceImei":gpsPacket.deviceImei,
                            "packetTime":gpsPacket.packetTime,
                            "noOfSat":gpsPacket.noOfSat,
                            "latitude":gpsPacket.latitude,
                            "longitude":gpsPacket.longitude,
                            "speed":gpsPacket.speed,
                            "direction":gpsPacket.direction.toString(),
                            "odometer":'',
                            "packetSerialNumber":parseInt(gpsPacket.packetSerialNumber),
                            "alertId":gpsPacket.alertId
                        };
        app.models.VtsDevices.find({'where':{'deviceImei':deviceGps.deviceImei}},function(err,vehicles){
            if(vehicles.length != 0){
                deviceGps.vehicleId = vehicles[0].deviceId;
                deviceGps.userId = vehicles[0].userId;
                deviceGps.companyId = vehicles[0].companyId;
                if(vehicles[0].vehicleOdometer != '0')
                    deviceGps.odometer = vehicles[0].vehicleOdometer;
            }
            var currentPacketTime = moment(deviceGps.packetTime,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            app.models.DeviceGps.find({where:{and:[{'deviceImei':deviceGps.deviceImei},{'packetTime':{lte:currentPacketTime}}]},order:'packetTime DESC',limit:1},function(err,instance){
                if(instance.length!=0){
                    var currentOdomter = instance[0].odometer;
                    var instanceTime = moment(instance[0].packetTime,'ddd MMM DD YYYY HH:mm:ss');

                    deviceGps.odometer = parseFloat(instance[0].odometer)+customLib.distanceBwLatLng(instance[0].latitude,instance[0].longitude,deviceGps.latitude,deviceGps.longitude);
                    deviceGps.odometer = deviceGps.odometer.toFixed(4).substring(0,15);
                }else{
                    if(deviceGps.odometer === '')
                        deviceGps.odometer = '0';
                }
                app.models.DeviceGps.find({where:{and:[{'deviceImei':deviceGps.deviceImei},{'packetTime':{gt:currentPacketTime}}]},order:'packetTime ASC'},function(ascerr,ascinstance){
                    var outOfOrder = false;
                    if(ascinstance.length!=0){
                        console.log('Outof order packet received at '+ deviceGps.packetTime + ' '+ascinstance.length);
                        outOfOrder = true;
                        var acurrentOdometer = parseFloat(ascinstance[0].odometer);
                        var ainstanceTime = moment(ascinstance[0].packetTime,'ddd MMM DD YYYY HH:mm:ss');

                        var correctedOdometer = parseFloat(deviceGps.odometer)+customLib.distanceBwLatLng(ascinstance[0].latitude,ascinstance[0].longitude,deviceGps.latitude,deviceGps.longitude);
                        var odometerdiff = correctedOdometer - acurrentOdometer;
                        if(odometerdiff > 0){
                            for(var i=0;i<ascinstance.length;i++){
                                var temp = {};
                                temp.odometer = parseFloat(ascinstance[i].odometer)+odometerdiff;
                                temp.odometer = temp.odometer.toFixed(4).substring(0,15);
                                console
                                ascinstance[i].updateAttributes(temp,function(err,obj){
                                    if(err)
                                        console.log('Odometer earlier packets update failed '+err+JSON.stringify(obj));

                                });
                            }
                        }
                    }
                    app.models.DeviceGps.create(deviceGps,function(err,obj){
                        if(err){
                            console.log('Data Store Failed '+err);
                            callback(false);
                        }else if(obj == null){
                            //console.log('Data Store Failed returned object is null'+err);
                            callback(false);
                        }else{
                            //console.log('Data Store Success returned object '+JSON.stringify(obj));
                            if(!outOfOrder){
                                var veh = {};
                                veh.vehicleOdometer = deviceGps.odometer;
                                vehicles[0].updateAttributes(veh,function(err,info){
                                    if(err){
                                        console.log('Error in updating vehicle odometer '+err);
                                    }
                                    callback(true);
                                });
                            }else{
                                callback(true);
                            }
                        }
                    });
                });
            });
        });
    },
    saveGpsPacketForBSTPL : function(gpsPacket,callback){
        var app = require('./server.js');
        var customLib = require('./customlib.js');
        var moment = require('moment');
        var deviceGps = {
                            "deviceImei":gpsPacket.deviceImei,
                            "packetTime":gpsPacket.packetTime,
                            "noOfSat":gpsPacket.noOfSat,
                            "latitude":gpsPacket.latitude,
                            "longitude":gpsPacket.longitude,
                            "speed":gpsPacket.speed,
                            "direction":gpsPacket.direction.toString(),
                            "odometer":gpsPacket.odometer,
                            "packetSerialNumber":parseInt(gpsPacket.packetSerialNumber),
                            "alertId":gpsPacket.alertId
                        };
        app.models.VtsDevices.find({'where':{'deviceImei':deviceGps.deviceImei}},function(err,vehicles){
            if(vehicles.length != 0){
                deviceGps.vehicleId = vehicles[0].deviceId;
                deviceGps.userId = vehicles[0].userId;
                deviceGps.companyId = vehicles[0].companyId;
            }
            app.models.DeviceGps.create(deviceGps,function(err,obj){
                if(err){
                    console.log('Data Store Failed '+err);
                    callback(false);
                }else if(obj == null){
                    //console.log('Data Store Failed returned object is null'+err);
                    callback(false);
                }else{
                    console.log('Data Store Success for BSTPL returned object '+JSON.stringify(obj));
                    callback(true);
                }
            });
        });
    },
    saveAlertPacket : function(alaram,callback){
        var app = require('./server.js');
        var moment = require('moment');
        var deviceGps = {
                            "deviceImei":alaram.deviceImei,
                            "packetTime":alaram.packetTime,
                            "noOfSat":alaram.noOfSat,
                            "latitude":alaram.latitude,
                            "longitude":alaram.longitude,
                            "speed":alaram.speed,
                            "direction":alaram.direction.toString(),
                            "odometer":'',
                            "packetSerialNumber":parseInt(alaram.packetSerialNumber),
                            "alertId":''
                        };

        var deviceAlert =   {
                                "deviceImei":alaram.deviceImei,
                                "packetTime":alaram.packetTime,
                                "packetSerialNumber":parseInt(alaram.packetSerialNumber),
                                "oeStatus":alaram.oeConnectionStatus,
                                "gpsStatus":alaram.activeStatus,
                                "alarmStatus":alaram.alaramStatus,
                                "chargeStatus":alaram.chargeStatus,
                                "accStatus":alaram.accStatus,
                                "activeStatus":alaram.activeStatus,
                                "voltageLevel":alaram.voltageLevel,
                                "gsmSignalStrength":alaram.gsmSignalPower
                            };

        app.models.VtsDevices.find({'where':{'deviceImei':deviceGps.deviceImei}},function(err,vehicles){
            if(vehicles.length != 0){
                deviceGps.vehicleId = vehicles[0].deviceId;
                deviceGps.userId = vehicles[0].userId;
                deviceGps.companyId = vehicles[0].companyId;
                deviceAlert.vehicleId = vehicles[0].deviceId;
                deviceAlert.userId = vehicles[0].userId;
                deviceAlert.companyId = vehicles[0].companyId;
            }
            app.models.DeviceAlerts.create(deviceAlert,function(err,obj){
                if(err){
                    console.log('Alarm Packet Store Failed '+err);
                    callback(false);
                }else if(obj == null){
                    console.log('Alarm Packet Failed returned object is null'+err);
                    callback(false);
                }else{
                    console.log('Alarm Packet Success returned object '+JSON.stringify(obj));
                    var alertId = obj.alertId;
                    deviceGps.alertId = alertId;
                    callback(true);
                    // app.models.DeviceGps.create(deviceGps,function(err,obj){
                    //     if(err){
                    //         console.log('Alarm Gps Store Failed '+err);
                    //         callback(false);
                    //     }else if(obj == null){
                    //         //console.log('Alarm Gps Failed returned object is null'+err);
                    //         callback(false);
                    //     }else{
                    //         //console.log('Alarm Gps Success returned object '+JSON.stringify(obj));
                    //         callback(true);
                    //     }
                    // });
                }
            });
        });
    },
    saveStatusPacket : function(heartbeat,callback){
        var app = require('./server.js');
        var moment = require('moment');
        var deviceStatus =   {
                                "deviceImei":heartbeat.deviceImei,
                                "packetTime":heartbeat.packetTime,
                                "packetSerialNumber":parseInt(heartbeat.packetSerialNumber),
                                "oeStatus":heartbeat.oeConnectionStatus,
                                "gpsStatus":heartbeat.activeStatus,
                                "alarmStatus":heartbeat.alarmStatus,
                                "chargeStatus":heartbeat.chargeStatus,
                                "accStatus":heartbeat.accStatus,
                                "activeStatus":heartbeat.activeStatus,
                                "voltageLevel":heartbeat.voltageLevel,
                                "gsmSignalStrength":heartbeat.gsmSignalPower
                            };

        app.models.VtsDevices.find({'where':{'deviceImei':deviceStatus.deviceImei}},function(err,vehicles){
            if(vehicles.length != 0){
                deviceStatus.vehicleId = vehicles[0].deviceId;
                deviceStatus.userId = vehicles[0].userId;
                deviceStatus.companyId = vehicles[0].companyId;
            }
            app.models.DeviceStatus.create(deviceStatus,function(err,obj){
                if(err){
                    console.log('Status Packet Failed '+err);
                    callback(false);
                }else if(obj == null){
                    //console.log('Status Packet Failed returned object is null'+err);
                    callback(false);
                }else{
                    //console.log('Status Packet Success returned object '+JSON.stringify(obj));
                    callback(true);
                }
            });
        });
    },
    processReceivedPacket : function(packetString,callback){
        var packetConfig = require('./packetConfigurations.js');
        var app = require('./server.js');
        var DataStore = require('./dataStore.js');

        console.log("Inside processReceivedPacket : "+packetString);

        if(packetString){
            try{
                var packet = JSON.parse(packetString);
            }catch(e){
                console.log('Error converting packetString '+ packetString);
                callback(false);
                return;
            }
            console.log("Packet type for the packet is " + packet.packetType);
            if(packet.packetType == "12" || packet.packetType == "22"){
                DataStore.saveGpsPacket(packet,function(status){
                    callback(status);
                });
            }else if(packet.packetType == "$1"){
                DataStore.saveGpsPacketForBSTPL(packet,function(status){
                    callback(status);
                });
            }else if(packet.packetType == "13"){
                DataStore.saveStatusPacket(packet,function(status){
                    callback(status);
                });
            }else if(packet.packetType == "16" || packet.packetType == "26" || packet.packetType == "27"){
                DataStore.saveAlertPacket(packet,function(status){
                    callback(status);
                });
            }else if(packet.packetType == "01"){
                callback(true);
            }else{
                callback(false);
                return;
            }
        }else{
            callback(false);
            return;
        }
    }
}
