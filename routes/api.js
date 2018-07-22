var express = require('express');
var router = express.Router();
const namor = require('namor');
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
                    var uuid = namor.generate({
                        words: 1,
                        numbers: 1
                    }); //Math.random().toString(16).substring(2, 7);
                    var d = new Date();
                    var dstr = d.toISOString();
                    d.setMinutes(d.getMinutes() + 5)
                    var params = {
                        TableName: table,
                        Item: {
                            "macaddress": macaddress,
                            "phone": "not set",
                            "timestamp": dstr,
                            "expiretime": d.toISOString(),
                            "uuid": uuid,
                            "mute": false,
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
    } else if (req.query.op === "postarray") {
        console.log(req.body);
        var mac_list = req.body.data;

        function updateParams(index) {
            if (index < mac_list.length) {
                var d = new Date();
                //currentUsers[mac_list[i]]=d.setMinutes(d.getMinutes() + 5);
                d.setMinutes(d.getMinutes() + 5);
                update_params = {
                    TableName: table,
                    Key: {
                        "macaddress": mac_list[index]
                    },
                    UpdateExpression: "set expiretime = :x",
                    ExpressionAttributeValues: {
                        ":x": d.toISOString()
                    }
                };

                docClient.update(update_params, function (err, data) {
                    if (err) {
                        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                    }
                    updateParams(index + 1);
                });
            } else {
                res.json({
                    "res": "success"
                });
            }
        }
        updateParams(0);
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
                    res.json({
                        "status": "success"
                    })
                } else {
                    res.json({
                        "status": "fail"
                    })
                }

            }
        });
    } else if (req.query.op === "getall") {

        var table = "hackathon"
        var scan_params = {
            TableName: table,
            ProjectionExpression: "macaddress"
        };

        docClient.scan(scan_params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                var macList = [];
                for (var i = 0; i < data.Items.length; i++) {
                    macList.push(data.Items[i].macaddress)
                }
                res.json({
                    "data": macList
                })
            }
        });

    } else if (req.query.op === "getallpeople") {
        var table = "hackathon";
        var d = new Date();
        var scan_params = {
            TableName: table,
            FilterExpression: "expiretime > :d and mute = :f ",
            ExpressionAttributeValues: {
                ":d": d.toISOString(),
                ":f": false
            }
        };

        docClient.scan(scan_params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log(data.Items);
                res.json({
                    "status": "success"
                });
            }
        });
    }
});


module.exports = router;