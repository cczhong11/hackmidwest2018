/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();

function getallpeople() {

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
    return docClient.scan(scan_params).promise();
}


const GetNewFactHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest' ||
            (request.type === 'IntentRequest' &&
                request.intent.name === 'pollIntent');
    },
    async handle(handlerInput) {
        //const factArr = data;
        //const factIndex = Math.floor(Math.random() * factArr.length);
        //const randomFact = factArr[factIndex];
        var speechOutput = "no one";
        var data = await getallpeople();
        var l = "";
        if (data.Items.length > 0) {
            console.log(JSON.stringify(data, null, 2));
            for (var i = 0; i < data.Items.length; i++) {
                l += data.Items[i].phone + " and ";

            }
            return handlerInput.responseBuilder
                .speak(l + "..")
                .withSimpleCard(SKILL_NAME, "none")
                .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak("none..")
                .withSimpleCard(SKILL_NAME, "none")
                .getResponse();
        }


        //return handlerInput.responseBuilder
        //  .speak(speechOutput+"..")
        //  .withSimpleCard(SKILL_NAME, "none")
        //  .getResponse();
    },
};

const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(HELP_MESSAGE)
            .reprompt(HELP_REPROMPT)
            .getResponse();
    },
};

const ExitHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            (request.intent.name === 'AMAZON.CancelIntent' ||
                request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(STOP_MESSAGE)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Sorry, an error occurred.')
            .reprompt('Sorry, an error occurred.')
            .getResponse();
    },
};

const SKILL_NAME = 'testpoll';
const GET_FACT_MESSAGE = 'Here\'s your fact: ';
const HELP_MESSAGE = 'You can say tell me a space fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
    .addRequestHandlers(
        GetNewFactHandler,
        HelpHandler,
        ExitHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();