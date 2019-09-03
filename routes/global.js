var express = require('express');
var router = express.Router();
// global.globalUrl = "https://api.wemaste.com/";

const config = require('../config/config.json');
const mode=config.env.mode;
const devUrlData=JSON.stringify(config.development.api_url);
const devUrl =devUrlData.substring(1, devUrlData.length - 1); 

const testUrlData=JSON.stringify(config.testing.api_url);
const testUrl =testUrlData.substring(1, testUrlData.length - 1);

const prodUrlData=JSON.stringify(config.production.api_url)
const prodUrl =prodUrlData.substring(1, prodUrlData.length - 1);  


if(mode == "development"){
    global.globalUrl=devUrl;
}
else if(mode == "testing"){
    global.globalUrl=testUrl;
  }
else{
    global.globalUrl=prodUrl; 
}

// global.globalUrl="http://18.218.37.224:8083/"

module.exports = router;