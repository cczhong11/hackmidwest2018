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

    }
});

module.exports = router;