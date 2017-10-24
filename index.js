var fs = require('fs'),
    path = require('path');

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
                    fs.mkdir(directory, callback);
                    resolve();
                    console.log('not found ---> creating it')
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
    appendedDirectory = '';

module.exports = function (options) {

    //No options passed => fallback to default options
    if (!options) {
        options = JSON.parse(JSON.stringify(defaultOptions));
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

        //Check for new day to start a new File
        var currentLogName = await getCurrentLogFileName(options);
        if (logFileName.length === 0 || currentLogName !== logFileName) {
            logFileName = currentLogName;
        }

        res
            .on("finish", async function () {
                let streamPath = path.join(options.storagePath + '/' + appendedDirectory);

                var logStream = fs.createWriteStream((streamPath) + logFileName, {
                    'flags': 'a',
                    'encoding': 'UTF8'
                });

                logStream.write("Request headers:" + JSON.stringify(req.headers));
                logStream.write('\r\n');
                logStream.write("Request response code:" + res.statusCode + '. Response message:' + res.statusMessage);
                logStream.write('\r\n');
                logStream.write('\r\n');
                logStream.end(function () {
                   
                });
                next()
            });
        next()
    }
}