var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

const defaultOptions = {
    storagePath: __dirname + '/logs',
    logType: 'day',
    logNameSeparator: '-'
};

function checkDirectory(directory, callback) {
    return new Promise((resolve, reject) => {
        fs
            .stat(directory, function (err, stats) {
                if (err) {
                    mkdirp(directory, function () {
                        resolve();
                    });

                } else {
                    resolve();
                    callback();
                }
            })
    })
}

function getCurrentDateAsName(config) {
    var currentDate = new Date();
    let date = currentDate
            .getUTCDate()
            .toString(),
        month = currentDate
            .getUTCMonth()
            .toString(),
        year = currentDate
            .getUTCFullYear()
            .toString();

    var logNameSeparator = config.logNameSeparator;

    return date + logNameSeparator + month + logNameSeparator + year;
}

async function getCurrentLogFileName(config) {
    switch (config.logType) {
        case 'day':
            var currentFileName = getCurrentDateAsName(config);
            return currentFileName + '.txt';
        case 'hour':
            var currentFolderName = getCurrentDateAsName(config);
            var currentDate = new Date();

            //add folder for this date to store hourly reports
            appendedDirectory = currentFolderName + '/';
            await checkDirectory(config.storagePath + '/' + appendedDirectory, function (res) {}, function (err) {});

            return currentFolderName + config.logNameSeparator + currentDate.getUTCHours() + '.txt';
        default:
            console.log('Not supported, yet!');
            return new Date().toString();

    }
}

var logDirectoryExists = false,
    logFileName = '',
    appendedDirectory = '',
    loggerInitializedOnce = false;

module.exports = function (options) {

    //No options passed => fallback to default options
    if (!options) {
        options = JSON.parse(JSON.stringify(defaultOptions));
    }

    return async function (req, res, next) {
        //The check should be performed only once, on app initialization
        if (!logDirectoryExists) {
            await checkDirectory(options.storagePath, function (result) {
                console.log(options.storagePath)
                logDirectoryExists = true;
            }, function () {
                logDirectoryExists = false;
            });
        }

        //Check for new day to start a new File
        var currentLogName = await getCurrentLogFileName(options);
        if (logFileName.length === 0 || currentLogName !== logFileName) {
            logFileName = currentLogName;
        }

        var streamPath = path.join(options.storagePath + '/' + appendedDirectory);

        //This should be executed only once
        if (!loggerInitializedOnce) {
            let logStream = fs.createWriteStream((streamPath) + logFileName, {
                'flags': 'a',
                'encoding': 'UTF8'
            });
            logStream.write("Logger service initialized on" + new Date().toUTCString());
            logStream.write('\r\n');
            logStream.end(function () {});
            loggerInitializedOnce = true;
        }

        res.on("finish", async function () {

            let logStream = fs.createWriteStream((streamPath) + logFileName, {
                'flags': 'a',
                'encoding': 'UTF8'
            });
            logStream.write("Request time: " + new Date().toUTCString());
            logStream.write('\r\n');
            logStream.write("Request headers:" + JSON.stringify(req.headers));
            logStream.write('\r\n');
            logStream.write("Request response code:" + res.statusCode + '. Response message:' + res.statusMessage);
            logStream.write('\r\n');
            logStream.write('\r\n');
            logStream.end(function () {});
            next()
        });
        next()
    }
}