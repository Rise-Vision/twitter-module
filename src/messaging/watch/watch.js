/* eslint-disable line-comment-position, no-inline-comments, max-statements */

const common = require("common-display-module");
const config = require("../../../src/config/config");
const logger = require("../../../src/logger");
const platform = require("rise-common-electron").platform;
const broadcastIPC = require("../../../src/messaging/broadcast-ipc.js");
const twitterWrapper = require("../../api/twitter-wrapper");

// So we ensure it will only be sent once.
let watchMessagesAlreadySentForContent = false;

function clearMessagesAlreadySentFlagForContent() {
  watchMessagesAlreadySentForContent = false;
}

let watchMessagesAlreadySentForCredentials = false;

function clearMessagesAlreadySentFlagForCredentials() {
  watchMessagesAlreadySentForCredentials = false;
}

function checkIfLocalStorageIsAvailable(message) {
  if (!watchMessagesAlreadySentForContent) {
    logger.debug(JSON.stringify(message));

    const clients = message.clients;

    if (clients.includes("local-storage")) {
      logger.file(`confirmation that local-storage is connected before sending WATCH`);
      return sendWatchMessagesForContentFile()
      .then(() => watchMessagesAlreadySentForContent = true);
    }
  }

  return Promise.resolve();
}

function sendWatchMessagesForCredentials() {
  if (!watchMessagesAlreadySentForCredentials) {
    const filePath = `risevision-company-notifications/${config.getCompanyId()}/credentials/twitter.json`;

    broadcastIPC.broadcast("watch", {filePath});

    logger.all("watch", `watch message sent for credentials at ${filePath}`);
  }

  return Promise.resolve();
}

function sendWatchMessagesForContentFile() {
  return common.getDisplayId()
  .then(displayId =>
    {
      const filePath = `risevision-display-notifications/${displayId}/content.json`;

      broadcastIPC.broadcast("watch", {filePath});

      logger.all("watch", `watch message sent for content at ${filePath}`);
    });
}

function loadCurrentCredentials(credentialsPath) {
  if (credentialsPath) {
    logger.debug(`reading ${credentialsPath}`);

    return platform.readTextFile(credentialsPath)
    .then(data =>
    {
      const credentials = JSON.parse(data);

      if (!Reflect.has(credentials, "oauth_token") || !Reflect.has(credentials, "oauth_token_secret")) {
        throw new Error("Invalid Credentials");
      }

      logger.file(`credentials changed ${JSON.stringify(credentials)}`);

      config.setTwitterCredentials(credentials);
      twitterWrapper.createClient();

    })
    .catch(error =>
      logger.error(error.message, `Could not parse credentials file ${credentialsPath}`)
    );
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
      // allows linking in tests.
      return Promise.resolve();

    default: return loadCurrentCredentials(message.ospath);
  }
}

function receiveContentFile(message) {
  logger.all(`content received with status: ${message.status || "invalid status"}`);

  if (["DELETED", "NOEXIST"].includes(message.status)) {return;}

  return platform.readTextFile(message.ospath)
  .then(fileData=>{
    try {
      logger.file(`content recieved - ${fileData}`);

      const fileJSON = JSON.parse(fileData);
      const isValidContent = Reflect.has(fileJSON, "content") && Reflect.has(fileJSON.content, "schedule");
      const companyId = isValidContent ? fileJSON.content.schedule.companyId : null;

      if (!companyId) {
        logger.file(`invalid content file - no companyId in content file`);
        return;
      }

      logger.file(`Setting companyId ${JSON.stringify(companyId)}`);
      config.setCompanyId(companyId);

      return sendWatchMessagesForCredentials().then(() => watchMessagesAlreadySentForCredentials = true);
    } catch (error) {
      logger.error(error.stack, `Could not parse content file ${message.ospath}`);
    }
  });
}

module.exports = {
  checkIfLocalStorageIsAvailable,
  clearMessagesAlreadySentFlagForContent,
  clearMessagesAlreadySentFlagForCredentials,
  receiveCredentialsFile,
  receiveContentFile
};
