let process = require('process');
let pjson = require('./package.json');

module.exports = function () {
    let currentVersion = parseFloat(process.versions.node);
    let requiredVersion = parseFloat(pjson.engines.minimumNodeVersion);
    let packageName = pjson.name;

    if (currentVersion < requiredVersion) {
        console.log(`Current version of node js is ${currentVersion}, while the required one is: ${requiredVersion}. ${packageName} is leaving.`);
        process.exit(1);
    }
}