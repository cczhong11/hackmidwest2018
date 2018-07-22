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

function sendDefaultTemplate(twime, res) {
    twiml.message("Hi\n\n/menu to access this menu\n/upload-pic To upload a profile pic\n/say to say something to everyone");
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
}

function handleTextRequest(body, res) {
    const twiml = new MessagingResponse();

    if (body.Body.startsWith("/register")) {
        const uuid = body.Body.replace("/register ", "");
        db.insertTelephoneNumber(uuid, body.From);
        sendDefaultTemplate(twiml, res);
    }
    else if (body.Body == "/menu" || body.Body.toLowerCase() == "hi") {
        sendDefaultTemplate(twiml, res);
    }
    else if (body.Body.startsWith("/find")) {
        const search = body.Body.replace("/find ", "\n");
        venueSearch.venueSearch(search, function (msg) {
            twiml.message(msg);
        });
    }
    else if (body.Body.startsWith("/say")) {
        db.getUserFromPhone(body.From, function (user) {
            const msg = body.Body.replace("/say ", "@" + user.uuid + "says:\n\n");
            db.getAllUsers(body.From, function (users) {
                for (var index = 0; index < users.length; index++) {
                    if (users[index].phone != "not set" && users[index].phone != body.From) {
                        client.messages.create({
                            body: msg,
                            to: users[index].phone,
                            from: '+14804627562'
                        }).then((message) => console.log(message.sid));
                    }
                }
            });
        });
    }
    else if (body.Body.match(/@[A-Za-z0-9]{5}\s(.*)/) != null) {
        db.getUserFromPhone(body.From, function (sender) {
            db.getUserFromUUID(body.Body.split(" ")[0].slice(1), function (receiver) {
                const msg = "@" + sender.uuid + " says:\n\n" + body.Body.split(" ").slice(1).join(" ");
                client.messages.create({
                    body: msg,
                    to: receiver.phone,
                    from: '+14804627562'
                }).then((message) => console.log(message.sid));
            });
        });
    }
    else if (body.Body == "/username") {
        db.getUserFromPhone(body.From, function (sender) {
            twiml.message("Your Username is @" + sender.uuid);
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
        });
    }
    else if (body.Body.match(/\/send \$[0-9.]* to @[A-Za-z0-9]{5}/) != null) { // Send money

    }
    else if (body.Body == "/mute" || body.Body == "/unmute") { // Mute or unmute conversations

    }
    else {
        sendDefaultTemplate(twiml, res);
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