const versionChecker = require('./versionChecker');
versionChecker();
const logger = require('./logger');

module.exports = function (options) {
    return logger(options);
}