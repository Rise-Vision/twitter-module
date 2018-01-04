const common = require("common-display-module");

const moduleName = "twitter";

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

module.exports = {
  bqProjectName: "client-side-events",
  bqDataset: "Module_Events",
  bqTable: "twitter_events",
  failedEntryFile: "twitter-failed.log",
  logFolder: common.getModulePath(moduleName),
  moduleName,
  getModuleVersion() {
    return common.getModuleVersion(moduleName)
  },
  getTwitterCredentials,
  setTwitterCredentials,
  getCompanyId,
  setCompanyId
};
