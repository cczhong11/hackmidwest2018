var express = require('express');
var router = express.Router();
var MessagingResponse = require('twilio').twiml.MessagingResponse;
var db = require("../lib/db");
var venueSearch = require("../lib/venue-search");

var twilio = require('twilio');
var accountSid = 'xxxxxxxxxxxxxxxx';
var authToken = 'xxxxxxxxxxxxxx';
var client = new twilio(accountSid, authToken);

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dbjaiwx9o',
    api_key: '957379348547858',
    api_secret: 'xxxxxxxxxxx'
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

function handleImageRequest(body, res) {
    const twiml = new MessagingResponse();
    if (body.Body === "/upload-pic") {
        cloudinary.v2.uploader.upload(body.MediaUrl0, function (error, result) {
            twiml.message("Profile pic uploaded");
            res.writeHead(200, {
                'Content-Type': 'text/xml'
            });
            res.end(twiml.toString());
        });
    } else if (body.Body === "/who") {
        cloudinary.v2.uploader.upload(body.MediaUrl0, {
            detection: "aws_rek_face"
        }, function (error, result) {
            if (result.info.detection.aws_rek_face.data &&
                result.info.detection.aws_rek_face.data.celebrity_faces &&
                result.info.detection.aws_rek_face.data.celebrity_faces.length) {

                var faces = result.info.detection.aws_rek_face.data.celebrity_faces;
                var names = "",
                    urls = "\n";
                for (var index = 0; index < faces.length; index++) {
                    names += faces[index].name + ", ";
                    if (faces[index].urls[0]) {
                        urls += faces[index].urls[0] + "\n";
                    }
                }
                names = names.slice(0, names.length - 2);
                twiml.message("Found " + names + " in the image. " + urls);
                res.writeHead(200, {
                    'Content-Type': 'text/xml'
                });
                res.end(twiml.toString());
            } else {
                twiml.message("Sorry, no celebrity matches were found for the image");
                res.writeHead(200, {
                    'Content-Type': 'text/xml'
                });
                res.end(twiml.toString());
            }
        });
    } else if (body.Body === "/what") {
        cloudinary.v2.uploader.upload(body.MediaUrl0, function (error, result) {
            if (result.tags.length) {
                twiml.message("We found " + result.tags.join(", ") + " in the image");
                res.writeHead(200, {
                    'Content-Type': 'text/xml'
                });
                res.end(twiml.toString());
            } else {
                twiml.message("Sorry, we were unable to find anything in the image");
                res.writeHead(200, {
                    'Content-Type': 'text/xml'
                });
                res.end(twiml.toString());
            }
        });
    }
}

function sendDefaultTemplate(twiml, res) {
    twiml.message("Hi\n\n/menu to access this menu" +
        "\n\n/say to say something to everyone" +
        "\n\n@<user> to DM a specific person" +
        "\n\n/find with whatever you fancy and find it nearby" +
        "\n\n/who with an image to identify a celebrity" +
        "\n\n/what with an image to describe a scene " +
        "\n\n/upload-pic To upload a profile pic" +
        "\n\n/device show/add/set to display, connect, or adjust IOT devices");
    res.writeHead(200, {
        'Content-Type': 'text/xml'
    });
    res.end(twiml.toString());
}

function handleTextRequest(body, res) {
    const twiml = new MessagingResponse();

    if (body.Body.startsWith("/register")) {
        const uuid = body.Body.replace("/register ", "");
        db.insertTelephoneNumber(uuid, body.From);
        sendDefaultTemplate(twiml, res);
    } else if (body.Body == "/menu" || body.Body.toLowerCase() == "hi") {
        sendDefaultTemplate(twiml, res);
    } else if (body.Body.startsWith("/find")) {
        const search = body.Body.replace("/find ", "\n");
        venueSearch.venueSearch(search, function (msg) {
            twiml.message("Name: " + msg.name + "\n" + "Link: " + msg.gLink);
            res.writeHead(200, {
                'Content-Type': 'text/xml'
            });
            res.end(twiml.toString());
        });
    } else if (body.Body.startsWith("/say")) {
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
    } else if (body.Body.match(/@[A-Za-z0-9]{5}\s(.*)/) != null) {
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
    } else if (body.Body == "/username") {
        db.getUserFromPhone(body.From, function (sender) {
            twiml.message("Your Username is " + sender.uuid);
            res.writeHead(200, {
                'Content-Type': 'text/xml'
            });
            res.end(twiml.toString());
        });
    } else if (body.Body.match(/\/send \$[0-9.]* to @[A-Za-z0-9]{5}/) != null) { // Send money

    } else if (body.Body == "/mute" || body.Body == "/unmute") { // Mute or unmute conversations
        db.setUserMute(body.From, body.Body == "/mute", function (sender) {
            twiml.message("You have been " + (body.Body == "/mute" ? "muted" : "unmuted") + " from global chat");
            res.writeHead(200, {
                'Content-Type': 'text/xml'
            });
            res.end(twiml.toString());
        });
    } else if (body.Body.startsWith("/device")) { //IOT Proof of Concept Functionalities
        var option = body.Body.replace("/device ", "");
        console.log(option);
        if (option.startsWith("add")) {
            // console.log("entered if");
            var deviceName = option.replace("add ", "");
            console.log(deviceName);
            db.insertDevice(deviceName, function (sender) {
                twiml.message(sender);
                res.writeHead(200, {
                    'Content-Type': 'text/xml'
                });
                res.end(twiml.toString());
            });
        } else if (option.startsWith("set")) {
            var option1 = option.replace("set ", "");
            var deviceName = option1.substr(0, option1.indexOf(' '));
            var value = option1.substr(option1.indexOf(' ') + 1);
            console.log(deviceName);
            console.log(value);
            db.modifyDevice(deviceName, value, function (sender) {
                twiml.message(sender);
                res.writeHead(200, {
                    'Content-Type': 'text/xml'
                });
                res.end(twiml.toString());
            });
        } else if (option.startsWith("show")) {
            var result = "";
            db.getAllDevices(function (sender) {
                for (var i = 0; i < sender.length; i++) {
                    result += sender[i].device + " " + sender[i].value + "\n";
                }
                console.log(result);
                twiml.message(result);
                res.writeHead(200, {
                    'Content-Type': 'text/xml'
                });
                res.end(twiml.toString());
            });
        }
    } else {
        sendDefaultTemplate(twiml, res);
    }
}

router.post("/sms", (req, res) => {
    const body = req.body;
    console.log(body);
    console.log("\n\n");

    if (body.MediaContentType0 === "image/jpeg") {
        handleImageRequest(body, res);
    } else {
        handleTextRequest(body, res);
    }
});

module.exports = router;