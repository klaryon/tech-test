const OneSignal = require('onesignal-node');
  
const appId = process.env.ONESIGNAL_APP_ID;
const apiKey = process.env.ONESIGNAL_API_KEY;
const twilioNumber = process.env.TWILIO_FROM_PHONE;

const client = new OneSignal.Client(appId, apiKey);

const registerDevice = async (options) => client.addDevice(options)
    .then((data) => data?.body);

const editDevice = async (identifier, props) => client.editDevice(identifier, props)
    .then((data) => data?.body);

const viewDevice = async (identifier) => client.viewDevice(identifier)
    .then((data) => data?.body);

const sendPushNotification = async (playerIds, message, picture, app_url) => client.createNotification({
    contents: { 'en': message },
    name: "Rand Send Push notification via API login",
    include_player_ids: playerIds,
    app_url,
    big_picture: picture 
    })
    .then((data) => data?.body);

const sendSMS = async (phoneNumber, message) => client.createNotification({
    contents: { 'en': message },
    name: "Rand Send SMS via API endpoint",
    sms_from: twilioNumber,
    include_phone_numbers: [phoneNumber],
    })
    .then((data) => data?.body);

module.exports = { editDevice, registerDevice, sendPushNotification, sendSMS, viewDevice }; 
