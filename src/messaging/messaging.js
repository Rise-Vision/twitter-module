const companyConfigBucket = "risevision-company-notifications";
const commonMessaging = require("common-display-module/messaging");
const config = require("../../src/config/config");
const watch = require("./watch/watch");
const update = require("./update/update");
const logger = require("../../src/logger");
const licensing = require("../../src/licensing");

function handleComponent(message) {
  return update.process(message);
}

function handleWSClientConnected() {
  return update.clear();
}

function handleFileUpdate(message) {
  if (!message.filePath || !message.filePath.startsWith(companyConfigBucket)) {
    return;
  }
  if (message.filePath.endsWith("/twitter.json")) {
    return watch.receiveCredentialsFile(message)
    .then(() => {update.processAll()});
  }
  if (message.filePath.endsWith("/content.json")) {
    return watch.receiveContentFile(message);
  }
}

function messageReceiveHandler(message) {
  switch (message.topic.toUpperCase()) {
    case "CLIENT-LIST":
      return watch.checkIfLocalStorageIsAvailable(message);
    case "LICENSING-UPDATE":
          return licensing.updateLicensingData(message);
    case "FILE-UPDATE":
      return handleFileUpdate(message);
    case "TWITTER-WATCH":
      return handleComponent(message);
    case "WS-CLIENT-CONNECTED":
      return handleWSClientConnected(message);
    default:
      logger.debug(`message recieved error - ${config.moduleName} - unrecognized message topic: ${message.topic}`);
  }
}

module.exports = {
  init() {
    commonMessaging.receiveMessages(config.moduleName).then((receiver) => {
      receiver.on("message", messageReceiveHandler);
    });
    return Promise.resolve();
  }
};
