/* eslint-disable line-comment-position, no-inline-comments, max-statements */

const config = require("../../../src/config/config");
const status = require("../../../src/messaging/status/status");
const logger = require("../../../src/logger");
const platform = require("rise-common-electron").platform;
const broadcastIPC = require("../../../src/messaging/broadcast-ipc.js");
const twitterWrapper = require("../../api/twitter-wrapper");

let watchMessagesAlreadySentForCredentials = false;

function clearMessagesAlreadySentFlagForCredentials() {
  watchMessagesAlreadySentForCredentials = false;
}

function isWatchMessagesAlreadySentForCredentials() {
  return watchMessagesAlreadySentForCredentials;
}

function sendWatchMessagesForCredentials() {
  if (!watchMessagesAlreadySentForCredentials) {
    const filePath = `risevision-company-notifications/${config.getCompanyId()}/credentials/twitter.json`;

    broadcastIPC.broadcast("watch", {filePath});

    watchMessagesAlreadySentForCredentials = true

    logger.all("watch", `watch message sent for credentials at ${filePath}`);
  }

  return Promise.resolve();
}

function loadCurrentCredentials(credentialsPath) {
  if (credentialsPath && platform.fileExists(credentialsPath)) {
    logger.debug(`reading ${credentialsPath}`);
    let retrievedData = null;

    return platform.readTextFile(credentialsPath)
    .then(data =>
    {
      status.updateReadyStatus(true);

      retrievedData = data;
      const credentials = JSON.parse(data);

      if (!Reflect.has(credentials, "oauth_token") || !Reflect.has(credentials, "oauth_token_secret")) {
        status.updateReadyStatus(false);
        throw new Error("Invalid Credentials");
      }

      logger.file(`credentials changed ${JSON.stringify(credentials)}`);

      config.setTwitterCredentials(credentials);
      twitterWrapper.createClient();

    })
    .catch(error =>
    {
      status.updateReadyStatus(false);
      logger.error(error.message, `Could not parse credentials file ${credentialsPath} - ${retrievedData}`);
    });
  }

  // allows linking in tests.
  return Promise.resolve();
}

function receiveCredentialsFile(message) {
  logger.all(`credentials received with status: ${message.status || "invalid status"}`);

  switch (message.status) {
    case "DELETED": case "NOEXIST":
      config.setTwitterCredentials(null);
      twitterWrapper.createClient();
      status.updateReadyStatus(false);
      // allows linking in tests.
      return Promise.resolve();

    default: return loadCurrentCredentials(message.ospath);
  }
}

module.exports = {
  clearMessagesAlreadySentFlagForCredentials,
  receiveCredentialsFile,
  sendWatchMessagesForCredentials,
  isWatchMessagesAlreadySentForCredentials
};
