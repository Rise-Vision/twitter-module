const commonMessaging = require("common-display-module/messaging");
const config = require("../../src/config/config");
const logger = require("../../src/logger");

function broadcast(topic, data = {}) {
  const message = Object.assign({}, {"from": config.moduleName, topic}, data);

  commonMessaging.broadcastMessage(message);
}

function licensingUpdate(isAuthorized, userFriendlyStatus, data = {}) {
  if (isAuthorized !== null && userFriendlyStatus) {
    logger.file(`Broadcasting LICENSING-UPDATE - ${userFriendlyStatus}`);

    const messageData = Object.assign({}, {'is_authorized': isAuthorized, 'user_friendly_status': userFriendlyStatus}, data);
    const messageObject = Object.assign({}, {through: 'ws'}, {data: messageData});
    broadcast("licensing-update", messageObject);
  } else {
    logger.file(`Attempted Licensing Update - Authorization status not recieved`);
  }
}

function twitterUpdate(data = {}) {
  if (!data.status) {throw new Error("broadcast - TWITTER-UPDATE - status is invalid");}
  logger.file(`Broadcasting ${data.status} TWITTER-UPDATE`);

  const messageObject = Object.assign({}, {through: 'ws'}, data);
  broadcast("twitter-update", messageObject);
}

module.exports = {
  broadcast,
  licensingUpdate,
  twitterUpdate
}
