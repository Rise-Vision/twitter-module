const companyConfigBucket = "risevision-company-notifications";
const displayConfigBucket = "risevision-display-notifications";
const commonMessaging = require("common-display-module/messaging");
const config = require("../../src/config/config");
const watch = require("./watch/watch");
const update = require("./update/update");
const logger = require("../../src/logger");
const status = require("./status/status");

function handleStatusRequest() {
  return status.sendStatusMessage();
}

function handleComponent(message) {
  return update.process(message);
}

function handleClientList(message) {
  return message;
}

function handleWSClientConnected() {
  update.clear();
}

function handleFileUpdate(message) {
  if (!message.filePath || !(message.filePath.startsWith(companyConfigBucket) || message.filePath.startsWith(displayConfigBucket))) {
    return;
  }
  if (message.filePath.endsWith("/twitter.json")) {
    return watch.receiveCredentialsFile(message)
    .then(() => {
        update.processAll();
    });
  }
}

function handleDisplayData(message) {
  logger.debug(`handle display data message ${JSON.stringify(message)}`);
  const displayData = message.displayData;
  if (displayData && displayData.companyId) {
    config.setCompanyId(displayData.companyId);
    return watch.sendWatchMessagesForCredentials();
  }
  return Promise.resolve();
}

function messageReceiveHandler(message) {
  if (!message.topic) {return;}
  switch (message.topic.toUpperCase()) {
    case "CLIENT-LIST":
      return handleClientList(message);
    case "DISPLAY-DATA-UPDATE":
      return handleDisplayData(message);
    case "FILE-UPDATE":
      return handleFileUpdate(message);
    case "TWITTER-WATCH":
      return handleComponent(message);
    case "TWITTER-STATUS-REQUEST":
      return handleStatusRequest();
    case "WS-CLIENT-CONNECTED":
      return handleWSClientConnected(message);
    default:
      logger.debug(`message received error - ${config.moduleName} - unrecognized message topic: ${message.topic}`);
  }
}

module.exports = {
  init() {
    logger.file(`LM is connected`);

    commonMessaging.receiveMessages(config.moduleName).then((receiver) => {
      receiver.on("message", messageReceiveHandler);
    });
    return Promise.resolve();
  }
};
