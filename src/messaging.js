const commonConfig = require("common-display-module");
const config = require("./config/config");
const watch = require("./watch");
const companyConfigBucket = "risevision-company-notifications";
const logger = require("./logger");
const components = require("./components");

function handleTwitterWatch(message) {
  try {
    if (!message.data.component_id) {
      throw new Error("component_id is invalid");
    } else if (!message.data.screen_name && !message.data.hashtag) {
      throw new Error("must include screen_name or hashtag");
    }

    components.addComponent(message.data.component_id, Object.assign({}, {screen_name: message.data.screen_name, hashtag: message.data.hashtag}));
} catch (error) {
    logger.file(`message recieved error - ${config.moduleName} - ${error}`);
  }
}

function handleFileUpdate(message) {
  if (!message.filePath || !message.filePath.startsWith(companyConfigBucket)) {
    return;
  }
  if (message.filePath.endsWith("/twitter.json")) {
    return watch.receiveCredentialsFile(message);
  }
  if (message.filePath.endsWith("/content.json")) {
    return watch.receiveContentFile(message);
  }
}

function messageReceiveHandler(message) {
  switch (message.topic.toUpperCase()) {
    case "CLIENT-LIST":
      return watch.checkIfLocalStorageIsAvailable(message);
    case "FILE-UPDATE":
      return handleFileUpdate(message);
    case "TWITTER-WATCH":
      return handleTwitterWatch(message);
    default:
      logger.file(`message recieved error - ${config.moduleName} - unrecognized message topic`);
  }
}

module.exports = {
  init() {
    commonConfig.receiveMessages(config.moduleName).then((receiver) => {
      receiver.on("message", messageReceiveHandler);
    });
    return Promise.resolve();
  }
};
