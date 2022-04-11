const KEY = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
const KEY_SMARTCONTRACTS = process.env.APPINSIGHTS_INSTRUMENTATIONKEY_SMARTCONTRACTS;

let appInsights = require("applicationinsights");
appInsights.setup(KEY)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .start(); // assuming connection string is in environment variables. start() can be omitted to disable any non-custom data
let client = appInsights.defaultClient;
let clientSmartContracts = new appInsights.TelemetryClient(KEY_SMARTCONTRACTS);
// client.context.tags[client.context.keys.cloudRole] = "Rand API";

const trackInsightsEvent = ({ name, props, userId, req={headers: {}} }) => {
    const accountId = req.headers['unique-id'];
    
    client.context.tags[client.context.keys.userAccountId] = accountId;
    client.context.tags[client.context.keys.userAuthUserId] = userId;
    client.trackEvent({name, properties: {...props, type: 'API'}});
};

const trackInsightsEventSmartContracts = ({ name, properties}) => {
    clientSmartContracts.trackEvent({name, properties: {...properties, type: 'API'}});
};

module.exports = { InsightsClient: client, trackInsightsEvent, trackInsightsEventSmartContracts };
