const config = require("../src/config/config");
const retryInteval = [];

function retryAfterStartup(fn, timeLimit, stopCondition) {
  // eslint-disable-next-line
  const ONE_MINUTE = 60 * 1000;
  const nextIndex = retryInteval.length;
  retryInteval.push(setInterval(()=>{
    if (config.getTimeSinceStartup() <= timeLimit && !stopCondition()) {
      fn();
    } else {
      clearInterval(retryInteval[nextIndex]);
    }
  }, ONE_MINUTE));
}

module.exports = {
  retryAfterStartup
};
