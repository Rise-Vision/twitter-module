const commonConfig = require("common-display-module");
const config = require("../../src/config/config");
const logger = require("../../src/logger");

function broadcast(topic, data = {}) {
  const message = Object.assign({}, {"from": config.moduleName, topic}, data);

  commonConfig.broadcastMessage(message);
}

function twitterUpdate(data = {}) {
  if (!data.status) {throw new Error("broadcast - TWITTER-UPDATE - status is invalid");}
  logger.file(`Broadcasting ${data.status} TWITTER-UPDATE`);

  const messageObject = Object.assign({}, data);
  broadcast("TWITTER-UPDATE", messageObject)
}

module.exports = {
  broadcast,
  twitterUpdate
}
