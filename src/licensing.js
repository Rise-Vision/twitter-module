/* eslint-disable max-statements */

const licensing = require("common-display-module/licensing");
const config = require("./config/config");
const componentsController = require("./components/components-controller");
const broadcastIPC = require("./messaging/broadcast-ipc");
const logger = require("./logger");

function requestLicensingData() {
  return licensing.requestLicensingData(config.moduleName)
  .catch(error => {
    logger.error(error.stack, "Error while requesting licensing data");
  });
}

function updateLicensingData(data) {
  if (licensing.containsSubscriptionDataForRisePlayerProfessional(data)) {
    const previousAuthorized = config.isAuthorized();
    const currentAuthorized = licensing.isRisePlayerProfessionalSubscriptionActive(data);

    // detect licensing change
    if (previousAuthorized !== currentAuthorized) {
      const userFriendlyStatus = currentAuthorized ? "authorized" : "unauthorized";

      config.setAuthorized(currentAuthorized);

      broadcastIPC.licensingUpdate(currentAuthorized, userFriendlyStatus);

      if (currentAuthorized) {
        componentsController.updateAllComponents();
      } else {
        componentsController.closeAllStreams();
      }

      return logger.all(userFriendlyStatus, "");
    }
  }

  return Promise.resolve();
}

module.exports = {
  requestLicensingData,
  updateLicensingData
};
