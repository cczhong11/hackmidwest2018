var express = require('express');
var router = express.Router();

/* GET users listing. */
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "hackathon";


router.post('/', function (req, res, next) {
    console.log(JSON.stringify(req.query))
    if (req.query.op === "create") {
        var telephone = req.query.tel
        // check whether it is in the table first
        var get_params = {
            TableName: table,
            Key: {
                'phone': {
                    S:  "not set"
                },
            }
        };
        
        ddb.getItem(params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                if (Object.keys(data).length === 0) {
                    res.json({
                        "status": "none"
                    });
                    return
                }
                
               
            }
        });


    }
});

module.exports = router;