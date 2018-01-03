const commonConfig = require("common-display-module");
const config = require("./config");
const watch = require("./watch");
const interval = require("./interval-schedule-check");
const companyConfigBucket = "risevision-company-notifications";
const logger = require("./logger");


commonConfig.receiveMessages(config.moduleName).then(receiver =>
{
  receiver.on("message", message => {
    switch (message.topic.toUpperCase()) {
      case "CLIENT-LIST":
        return watch.checkIfLocalStorageIsAvailable(message);
      case "FILE-UPDATE":
        if (!message.filePath) {return;}
        if (!message.filePath.startsWith(companyConfigBucket)) {return;}

        if (message.filePath.endsWith("/twitter.txt")) {
          return watch.receiveCredentialsFile(message);
        }
        if (message.filePath.endsWith("/content.json")) {
          return watch.receiveContentFile(message);
        }
    }
  });

  commonConfig.getClientList(config.moduleName);

  if (process.env.NODE_ENV !== "test") {logger.all("started", "")}
});
