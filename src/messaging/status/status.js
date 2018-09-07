const config = require("../../../src/config/config");
const broadcastIPC = require("../../../src/messaging/broadcast-ipc");

function updateReadyStatus(newStatus) {
  const previousStatus = config.getReadyStatus();

  if (previousStatus !== newStatus) {
    config.setReadyStatus(newStatus);
    sendStatusMessage();
  }
}

function sendStatusMessage() {
  broadcastIPC.statusUpdate();
}

module.exports = {
  updateReadyStatus,
  sendStatusMessage
};
