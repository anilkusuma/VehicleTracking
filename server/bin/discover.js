
module.exports = function(ds){
    var fs = require('fs');
    var jsonUpdate = require('json-update');
    // Discover and build models from server table
    ds.discoverModelDefinitions({all:true,views: false, limit: 2000},
        function (err, models) {
            for(var i = 0;i<models.length;i++){
                if(models[i].type == 'table' && models[i].owner == 'db_ads'){
                        console.log('model name'+models[i].name);
                        ds.discoverSchema(models[i].name, {visited:{},schema:'db_ads',all: true},
                        function (err,schema) {
                            console.log(schema);
                                var name = schema.options.mysql.table;
                                name = name.toString().split('_').join('-');
                                var n = schema.name;
                                console.log('name is :' + name);
                                var jsaonPath = '/Users/anilkusuma/Downloads/NodeProjects/vts/server/models/'+name+'.json';
                                var jsPath = '/Users/anilkusuma/Downloads/NodeProjects/vts/server/models/'+name+'.js';
                                fs.writeFile(jsaonPath,JSON.stringify(schema,null,'\t'),function(err,data){
                                    if(err) return console.log(err);
                                    else console.log(data);
                                });
                                fs.writeFile(jsPath,'module.exports = function('+schema.name+') {\n \n };',function(err,data){
                                    if(err) return console.log(err);
                                    else console.log(data);
                                });
                            
                                jsonUpdate.update('/Users/anilkusuma/Downloads/NodeProjects/vts/server/model-config.json',{[n]: {dataSource:"MySqlDB",public: true}}, function(err, obj) {
                                  if (typeof err !== "undefined" && err !== null) {
                                    console.log("Error updating json: " + err.message);
                                  }
                                  console.log(obj);
                                });
                        }
                    );
                }
            }
        }
    );
//    ds.discoverSchemas(, {visited:{},schema:'db_ads',all: true},
//        function (err, models) {
//            console.log("modules :",models);
//        }
//    );
};