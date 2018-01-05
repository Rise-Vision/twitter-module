const common = require("common-display-module");
const twitterAppCredentials = require("../../src/twitter-app-credentials");

const MODULE_NAME = "twitter";

let twitterCredentials = null;
let companyId = null;

function getCompanyId() {
  return companyId;
}

function setCompanyId(id) {
  companyId = id;
}

function getTwitterCredentials() {
  return twitterCredentials;
}

function setTwitterCredentials(credentials) {
  twitterCredentials = credentials;
}

function getAppCredentials() {
  return twitterAppCredentials;
}

module.exports = {
  moduleName: MODULE_NAME,
  bqProjectName: "client-side-events",
  bqDataset: "Module_Events",
  bqTable: "twitter_events",
  failedEntryFile: `${MODULE_NAME}-failed.log`,
  logFolder: common.getModulePath(MODULE_NAME),
  getTwitterCredentials,
  setTwitterCredentials,
  getCompanyId,
  setCompanyId,
  getAppCredentials
};
