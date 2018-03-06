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
  logger.all("received licensing update", JSON.stringify(data));

  if (licensing.containsSubscriptionDataForRisePlayerProfessional(data)) {
    const previousAuthorized = config.isAuthorized();
    const currentAuthorized = licensing.isRisePlayerProfessionalSubscriptionActive(data);

    // detect licensing change
    if (previousAuthorized !== currentAuthorized) {
      config.setAuthorized(currentAuthorized);

      sendLicensing();

      if (currentAuthorized) {
        componentsController.updateAllComponents();
      } else {
        componentsController.finishAllRefreshes();
      }

      return logger.all(_getUserFriendlyStatus(), "");
    }
  }

  return Promise.resolve();
}

function sendLicensing() {
  broadcastIPC.licensingUpdate(config.isAuthorized(), _getUserFriendlyStatus());
}

function _getUserFriendlyStatus() {
  return config.isAuthorized() ? "authorized" : "unauthorized";
}

module.exports = {
  requestLicensingData,
  updateLicensingData,
  sendLicensing
};
