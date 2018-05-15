const config = require("../src/config/config");
const retryInterval = [];

function retryAfterStartup(fn, timeLimit, stopCondition) {
  // eslint-disable-next-line
  const ONE_MINUTE = 60 * 1000;
  const nextIndex = retryInterval.length;
  retryInterval.push(setInterval(()=>{
    if (config.getTimeSinceStartup() <= timeLimit && !stopCondition()) {
      fn();
    } else {
      clearInterval(retryInterval[nextIndex]);
    }
  }, ONE_MINUTE));
}

module.exports = {
  retryAfterStartup
};
