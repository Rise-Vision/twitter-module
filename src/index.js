const commonMessaging = require("common-display-module/messaging");
const config = require("./config/config");
const logger = require("./logger");
const messaging = require("./messaging/messaging");

messaging.init()
  .then(()=>{
    commonMessaging.getClientList(config.moduleName);

    if (process.env.NODE_ENV !== "test") {logger.all("started", "")}
  })
  .catch(error =>{
    logger.error(error.message, `Could not start ${config.moduleName} module`)
  });
