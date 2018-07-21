var express = require('express');
var router = express.Router();

/* GET users listing. */
var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "hackathon";


router.post('/', function(req, res, next) {
    console.log(JSON.stringify(req.query))
    if (req.query.op==="create"){
        var macaddress = req.query.addr
        var params = {
            TableName:table,
            Item:{
                "macaddress":macaddress,
                "phone": "not set",
                "timestamp": new Date().toISOString(),
                "info":{
                    "foursqure": "none",
                    "rating": 0
                }
            }
        }
        docClient.put(params, function(err, data) {
            if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("Added item:", JSON.stringify(data, null, 2));
                }
            });
            res.json({"status":"success"})
    }
  });

module.exports = router;
