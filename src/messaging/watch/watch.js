/* eslint-disable line-comment-position, no-inline-comments */

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
  }

  return Promise.resolve();
}

function sendWatchMessagesForContentFile() {
  return common.getDisplayId()
  .then(displayId =>
    {
      const filePath = `risevision-display-notifications/${displayId}/content.json`;

      broadcastIPC.broadcast("watch", {filePath});
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
  if (["DELETED", "NOEXIST"].includes(message.status)) {return;}

  return platform.readTextFile(message.ospath)
  .then(fileData=>{
    try {
      const fileJSON = JSON.parse(fileData);
      if (!fileJSON.content.schedule.companyId) {throw new Error("Invalid CompanyId");}

      logger.file(`Setting companyId ${JSON.stringify(fileJSON.content.schedule.companyId)}`);

      config.setCompanyId(fileJSON.content.schedule.companyId);
      return sendWatchMessagesForCredentials().then(() => watchMessagesAlreadySentForCredentials = true);
    } catch (error) {
      logger.error(error.stack, `Could not parse content file ${message.ospath}`)
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
