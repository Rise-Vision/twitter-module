const companyConfigBucket = "risevision-company-notifications";
const displayConfigBucket = "risevision-display-notifications";
const commonMessaging = require("common-display-module/messaging");
const broadcastIPC = require("./broadcast-ipc");
const config = require("../../src/config/config");
const watch = require("./watch/watch");
const update = require("./update/update");
const logger = require("../../src/logger");
const status = require("./status/status");

let initialRequestAlreadySent = false;

function handleStatusRequest() {
  status.sendStatusMessage();

  // The watch was removed because twitter.json was DELETED or NOEXIST,
  // and thus the ready status was changed from null to false;
  // so we send the WATCH message again to see if the file is back.
  if (config.getReadyStatus() === false) {
    watch.sendWatchMessagesForCredentials();
  }
}

function handleComponent(message) {
  return update.process(message);
}

function handleClientList(message) {
  requestDisplayDataIfLicensingAvailable(message);
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

function requestDisplayDataIfLicensingAvailable(message) {
  if (!initialRequestAlreadySent) {
    const clients = message.clients;
    if (clients.includes("licensing")) {
      broadcastIPC.broadcast('display-data-request');
      initialRequestAlreadySent = true;
    }
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
