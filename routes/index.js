var express = require('express');
var router = express.Router();
var MessagingResponse = require('twilio').twiml.MessagingResponse;
var db = require("../lib/db");
var venueSearch = require("../lib/venue-search");

var twilio = require('twilio');
var accountSid = 'AC5d3e038364d1c3628c4a56a1585ade0c';
var authToken = '047877cc86d2dc3b072e4beb4b57606a';
var client = new twilio(accountSid, authToken);

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dbjaiwx9o',
    api_key: '957379348547858',
    api_secret: 'rkZWvN_KZ3JRkm401WdfIJFoY9c'
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

function handleImageRequest(body, res) {
    const twiml = new MessagingResponse();
    if (body.Body === "/upload-pic") {
        cloudinary.v2.uploader.upload(body.MediaUrl0, function (error, result) {
            console.log(error);
            console.log(result);
        });
    }

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
}


function handleTextRequest(body, res) {
    const twiml = new MessagingResponse();

    if (body.Body.startsWith("/register")) {
        const uuid = body.Body.replace("/register ", "");
        db.insertTelephoneNumber(uuid, body.From);
        twiml.message("Hi\n\n/menu to access this menu\n/upload-pic To upload a profile pic\n/say to say something to everyone");
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
    }
    else if (body.Body.startsWith("/find")) {
        const search = body.Body.replace("/find ", "\n");
        venueSearch.venueSearch(search, function (msg) {
            twiml.message(msg);
        });
    }
    else if (body.Body.startsWith("/say")) {
        const msg = body.Body.replace("/say ", "\n");
        db.getAllUsers(body.From, function (users) {
            for (var index = 0; index < users.length; index++) {
                console.log(users[index]);
                if (users[index].phone != "not set" && users[index].phone != body.From) {
                    console.log("\n\n", users[index].phone, msg);
                    client.messages.create({
                        body: msg,
                        to: users[index].phone,
                        from: '+14804627562'
                    })
                        .then((message) => console.log(message.sid));
                }
            }
        });
    }
    else {
        twiml.message("Hi\n\n/menu to access this menu\n/upload-pic To upload a profile pic\n/say to say something to everyone");
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
    }
}

router.post("/sms", (req, res) => {
    const body = req.body;
    console.log(body);
    console.log("\n\n");

    if (body.MediaContentType0 === "image/jpeg") {
        handleImageRequest(body, res);
    }
    else {
        handleTextRequest(body, res);
    }
});

module.exports = router;