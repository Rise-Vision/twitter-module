const commonConfig = require("common-display-module");
const config = require("./config/config");
const logger = require("./logger");
const messaging = require("./messaging/messaging");

messaging.init()
  .then(()=>{
    commonConfig.getClientList(config.moduleName);
    if (process.env.NODE_ENV !== "test") {logger.all("started", "")}
  })
  .catch(error =>{
    logger.error(error.message, `Could not start ${config.moduleName} module`)
  });
