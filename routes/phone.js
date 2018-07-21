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
        var scan_params = {
            TableName : table,
            FilterExpression: "phone = :p",
            ExpressionAttributeValues:{":p": "not set"}
        };
        
        docClient.scan(scan_params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log(JSON.stringify(err, null, 2))
                if (data.Items.length === 0) {
                    res.json({
                        "status": "none"
                    });
                    return
                }
                var to_set = data.Items[0];
                to_set.phone={"S":telephone}
                update_params = {
                    TableName: table,
                    Key: {
                        "macaddress": to_set.macaddress
                    },
                    UpdateExpression: "set phone = :x",
                    ExpressionAttributeValues: {
                        ":x":telephone
                    }
                };
                docClient.update(update_params, function(err, data) {
                    if (err) {
                        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                        res.json({"status":"success"})
                    }
                });
            }
        });


    }
});

module.exports = router;