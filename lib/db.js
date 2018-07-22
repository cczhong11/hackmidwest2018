/* GET users listing. */
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();
var db = new AWS.DynamoDB();
var table = "hackathon";


module.exports = {
    insertTelephoneNumber: function (uuid, telephone) {
        var scan_params = {
            TableName: table,
            FilterExpression: "#u = :p ",
            ExpressionAttributeNames: {
                "#u": "uuid"
            },
            ExpressionAttributeValues: {":p": uuid}
        };

        docClient.scan(scan_params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log(data.Items);
                var to_set = data.Items[0];
                to_set.phone = {"S": telephone};
                update_params = {
                    TableName: table,
                    Key: {
                        "macaddress": to_set.macaddress
                    },
                    UpdateExpression: "set phone = :x",
                    ExpressionAttributeValues: {
                        ":x": telephone
                    }
                };
                docClient.update(update_params, function (err, data) {
                    if (err) {
                        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));

                    }
                });
            }
        });
    },
    getAllUsers: function (phoneNumber, cb) {
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
                cb(data.Items);
            }
        });
    },
    setUserMute:function(phoneNumer,mutevalue,cb){
        var table = "hackathon"
        var scan_params = {
            TableName: table,
            FilterExpression: "phone = :p",
            ExpressionAttributeValues: {":p": phoneNumber},
            ProjectionExpression: "macaddress"
        };

        docClient.scan(scan_params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                if(data.Items.length>0)
                {
                    update_params = {
                        TableName: table,
                        Key: {
                            "macaddress": data.Items[0].macaddress
                        },
                        UpdateExpression: "set mute = :x",
                        ExpressionAttributeValues: {
                            ":x": mutevalue
                        }
                    };
    
                    docClient.update(update_params, function (err, data) {
                        if (err) {
                            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                        }
                        
                    });
                }
                
            }
        });
    },
    getUserFromPhone:function(phoneNumber,cb){
        var table = "hackathon"
        var scan_params = {
            TableName: table,
            FilterExpression: "phone = :p",
            ExpressionAttributeValues: {":p": phoneNumber}
        };

        docClient.scan(scan_params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                if(data.Items.length>0)
                cb(data.Items[0]);
                
            }
        });
    }
};