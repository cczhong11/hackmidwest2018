var express = require('express');
var router = express.Router();
var MessagingResponse = require('twilio').twiml.MessagingResponse;
var insertTelephoneNumber = require("../lib/insert-telephone");

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

    if(body.Body.startsWith("/register")) {
        const uuid = body.Body.replace("/register ", "");
        insertTelephoneNumber(uuid, body.From);
        twiml.message("\nHi\n\n/menu to access this menu\n/upload-pic To upload a profile pic\n/say to say something to everyone");
    }
    else if (body.Body.startsWith("/say")) {
        const msg = body.Body.replace("/say ", "");
        // Send to everyone
        console.log("send " + msg + " to everyone");
    }
    else {
        twiml.message("\nHi\n\n/menu to access this menu\n/upload-pic To upload a profile pic\n/say to say something to everyone");
    }

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
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