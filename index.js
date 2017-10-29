var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    endOfLine = require('os').EOL;

const defaultOptions = {
    storagePath: __dirname + '/logs',
    logType: 'day',
    logNameSeparator: '-',
    logMode: 'all',
    logRequestBody: true
};

function initlizeLogger(streamPath, logFileName) {
    let logStream = fs.createWriteStream((streamPath) + logFileName, {
        'flags': 'a',
        'encoding': 'UTF8'
    });
    logStream.write("Logger service initialized on" + new Date().toUTCString());
    logStream.write(endOfLine);
    logStream.end(function () {});
    loggerInitializedOnce = true;
}

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

function logContentToFile(res, req, streamPath, logFileName) {
    let logStream = fs.createWriteStream((streamPath) + logFileName, {
        'flags': 'a',
        'encoding': 'UTF8'
    });
    logStream.write("Request time: " + new Date().toUTCString());
    logStream.write(endOfLine);
    logStream.write("Request headers:" + JSON.stringify(req.headers));
    logStream.write(endOfLine);
    logStream.write("Request response code:" + res.statusCode + '. Response message:' + res.statusMessage);
    if (defaultOptions.logRequestBody && res.cachedBody) {
        logStream.write(endOfLine);
        logStream.write("Response message from body:" + res.cachedBody);
        res.cachedBody = null;
    }

    logStream.write(endOfLine);
    logStream.write(endOfLine);
    logStream.end(function () {});
}

function overrideResponseSend(res) {
    res.sendOverriden = res.send;
    res.send = function (chunk) {
        if (typeof chunk === 'string') {
            res.cachedBody = chunk;
        }

        res
            .sendOverriden
            .call(this, chunk);
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
    } else {
        for (var prop in defaultOptions) {
            if (!options.hasOwnProperty(prop)) {
                options[prop] = defaultOptions[prop];
            }
        }
    }

    return async function (req, res, next) {
        //The check should be performed only once, on app initialization
        if (!logDirectoryExists) {
            await checkDirectory(options.storagePath, function (result) {
                logDirectoryExists = true;
            }, function () {
                logDirectoryExists = false;
            });
        }

        if (defaultOptions.logRequestBody) {
            overrideResponseSend(res);
        }

        var currentLogName = await getCurrentLogFileName(options);

        if (logFileName.length === 0 || currentLogName !== logFileName) {
            logFileName = currentLogName;
        }

        var streamPath = path.join(options.storagePath + '/' + appendedDirectory);

        //This should be executed only once
        if (!loggerInitializedOnce) {
            initlizeLogger(streamPath, logFileName);
        }

        res
            .on("finish", async function () {
                console.log(res.cachedBody)
                if (options.logMode === 'all') {
                    logContentToFile(res, req, streamPath, logFileName);
                } else if (options.logMode === 'errors' && res.statusCode >= 400) {
                    logContentToFile(res, req, streamPath, logFileName);
                }

                next()
            });
        next()
    }
};