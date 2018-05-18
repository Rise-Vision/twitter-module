const config = require("../src/config/config");
const logger = require("./logger");

const retryInterval = [];

function retryAfterStartup(fn, timeLimit, stopCondition) {
  // eslint-disable-next-line
  const ONE_MINUTE = 60 * 1000;
  const nextIndex = retryInterval.length;
  retryInterval.push(setInterval(()=>{
    if (config.getTimeSinceStartup() <= timeLimit && !stopCondition()) {
      logger.all("info", `retrying to call method ${fn.name}`);
      fn();
    } else {
      if (!stopCondition()) {
        logger.error(`failed to reach stopcondition - not calling ${fn.name}`);
      }
      clearInterval(retryInterval[nextIndex]);
    }
  }, ONE_MINUTE));
}

module.exports = {
  retryAfterStartup
};
