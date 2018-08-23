const commonMessaging = require("common-display-module/messaging");
const config = require("../../src/config/config");
const logger = require("../../src/logger");

function broadcast(topic, data = {}) {
  const message = Object.assign({}, {"from": config.moduleName, topic}, data);

  return commonMessaging.broadcastMessage(message);
}

function twitterUpdate(data = {}) {
  if (!data.status) {throw new Error("broadcast - TWITTER-UPDATE - status is invalid");}
  logger.file(`Broadcasting ${data.status} TWITTER-UPDATE`);

  const messageObject = Object.assign({}, {through: 'ws'}, data);
  broadcast("twitter-update", messageObject);
}

module.exports = {
  broadcast,
  twitterUpdate
}
