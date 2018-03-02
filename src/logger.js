/* eslint-disable space-in-parens */
const common = require("common-display-module");
const {
  bqProjectName, bqDataset, bqTable, failedEntryFile, logFolder,
  moduleName
} = require("./config/config");

const externalLogger = require("common-display-module/external-logger")(bqProjectName, bqDataset, failedEntryFile);
const logger = require("rise-common-electron/logger")(externalLogger, logFolder, moduleName);

// Creates the detail data structure that the logging functions expect.
// Assigns "event_details" and "display_id", that are expected in the events table
function detailsFor(eventDetails, data = {}) {
  return common.getDisplayId().then(displayId =>
    Object.assign({
      "event_details": eventDetails,
      "display_id": displayId,
      "version": common.getModuleVersion(moduleName) || "unknown"
    }, data)
  );
}

function error(eventDetails, userFriendlyMessage) {
  return detailsFor(`${eventDetails}  - ${userFriendlyMessage}`)
  .then(detail => logger.error(detail, userFriendlyMessage, bqTable));
}

function all(eventType, eventDetails, data = {}) {
  return detailsFor(eventDetails, data)
    .then(detail => logger.all(eventType, detail, null, bqTable));
}

/**
 * @return {Promise} so it can be chained.
 */
function external(eventType, eventDetails, data = {}) {
  return detailsFor(eventDetails, data)
  .then(detail => logger.external(eventType, detail, bqTable));
}

module.exports = {
  file: logger.file,
  debug: logger.debug,
  error,
  external,
  all
};
