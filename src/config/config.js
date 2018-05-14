const common = require("common-display-module");
const twitterAppCredentials = require("./twitter-app-credentials");

const MODULE_NAME = "twitter";

let twitterCredentials = null;
let companyId = null;

// will turn to either true or false when valid license data is received
let authorized = null;

const timeStarted = new Date();

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

function setAuthorized(flag) {
  authorized = flag;
}

function isAuthorized() {
  return authorized;
}

function getTimeSinceStartup() {
  return Math.abs(new Date() - timeStarted);
}

module.exports = {
  secondMillis: 1000,
  defaultComponentUpdateIntervalSeconds: 60,
  moduleName: MODULE_NAME,
  bqProjectName: "client-side-events",
  bqDataset: "Module_Events",
  bqTable: "tweet_events",
  failedEntryFile: `${MODULE_NAME}-failed.log`,
  logFolder: common.getModulePath(MODULE_NAME),
  tweetsRefreshTime: 60 * 60 * 1000, // eslint-disable-line
  getTwitterCredentials,
  setTwitterCredentials,
  getCompanyId,
  setCompanyId,
  getAppCredentials,
  getTimeSinceStartup,
  setAuthorized,
  isAuthorized
};
