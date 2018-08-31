const config = require("../../../src/config/config");
const broadcastIPC = require("../../../src/messaging/broadcast-ipc");
const twitter = require("../../../src/api/twitter");

function updateReadyStatus(status) {
  const previousStatus = config.getReadyStatus();
  const newStatus = status && twitter.credentialsExist;

  if (previousStatus !== newStatus) {
    config.setReadyStatus(newStatus);
    this.sendStatusMessage();
  }
}

function sendStatusMessage() {
  const statusValue = config.getReadyStatus() !== null && config.getReadyStatus() === true;
  broadcastIPC.broadcast("Twitter-Status-Update", {
    "status": statusValue,
    "userFriendlyStatus": statusValue ? "ready" : "not ready"
  });
}

module.exports = {
  updateReadyStatus,
  sendStatusMessage
};
