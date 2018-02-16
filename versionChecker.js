let process = require('process');
let pjson = require('./package.json');

module.exports = function () {
    let currentVersion = process.versions.node,
        requiredVersion = pjson.engines.minimumNodeVersion,
        packageName = pjson.name;

    let currentMajorVersion = Number.parseInt(currentVersion.split('.')[0]),
        currentMinorVersion = Number.parseInt(currentVersion.split('.')[1]),
        requiredMajorVersion = Number.parseInt(requiredVersion.split('.')[0]),
        requiredMinorVersion = Number.parseInt(requiredVersion.split('.')[1]);

    const currentVersionIsCompatible = (currentMajorVersion > requiredMajorVersion) || ((currentMajorVersion === requiredMajorVersion) && (currentMinorVersion >= requiredMinorVersion));

    if (!currentVersionIsCompatible) {
        console.log(`Current version of node js is ${currentVersion}, while the required one is: ${requiredVersion}. ${packageName} is leaving.`);
        process.exit(1);
    }
}