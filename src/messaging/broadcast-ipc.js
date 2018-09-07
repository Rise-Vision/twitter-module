const commonMessaging = require("common-display-module/messaging");
const config = require("../../src/config/config");
const logger = require("../../src/logger");

function broadcast(topic, data = {}) {
  const message = Object.assign({}, {"from": config.moduleName, topic}, data);

  return commonMessaging.broadcastMessage(message);
}

function statusUpdate() {
  const statusValue = config.getReadyStatus() !== null && config.getReadyStatus() === true;
  logger.file(`Credentials changed - sending credentials status - ${statusValue}`);

  const messageObject = {"status": statusValue, "userFriendlyStatus": statusValue ? "ready" : "not ready", through: 'ws'};
  broadcast("twitter-status-update", messageObject);
}

function twitterUpdate(data = {}) {
  if (!data.status) {throw new Error("broadcast - TWITTER-UPDATE - status is invalid");}
  logger.file(`Broadcasting ${data.status} TWITTER-UPDATE`);

  const messageObject = Object.assign({}, {through: 'ws'}, data);
  broadcast("twitter-update", messageObject);
}

module.exports = {
  broadcast,
  statusUpdate,
  twitterUpdate
}
