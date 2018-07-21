var express = require('express');
var router = express.Router();

/* GET users listing. */
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();
var db = new AWS.DynamoDB();
var table = "hackathon";


router.post('/', function (req, res, next) {
    console.log(JSON.stringify(req.query))
    if (req.query.op === "create") {
        var macaddress = req.query.addr
        // check whether it is in the table first
        var get_params = {
            TableName: table,
            Key: {
                'macaddress': {
                    "S": macaddress
                },
            }
        };
        var flag = 0;
        db.getItem(get_params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item3 :", JSON.stringify(data));
                if ("Item" in data && data.Item.length !== 0) {
                    res.json({
                        "status": "again"
                    })
                } else {
                    var uuid = Math.random().toString(16).substring(2, 7);
                    var params = {
                        TableName: table,
                        Item: {
                            "macaddress": macaddress,
                            "phone": "not set",
                            "timestamp": new Date().toISOString(),
                            "uuid": uuid,
                            "info": {
                                "foursqure": "none",
                                "rating": 0
                            }
                        }
                    }
                    docClient.put(params, function (err, data) {
                        if (err) {
                            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Added item:", JSON.stringify(data, null, 2));
                        }
                    });
                    res.json({
                        "status": uuid
                    })
                }

            }
        });


    }
});
router.get('/', function (req, res, next) {
    if (req.query.op === "get") {
        var macaddress = req.query.addr
        // check whether it is in the table first
        var get_params = {
            TableName: table,
            Key: {
                'macaddress': {
                    "S": macaddress
                },
            }
        };
        db.getItem(get_params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item3 :", JSON.stringify(data));
                if ("Item" in data && data.Item.length !== 0) {
                    res.json({"status": "success"})
                } else {
                    res.json({"status": "fail"})
                }

            }
        });
    }
});

module.exports = router;