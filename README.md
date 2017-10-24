

Prerequisites
-----------
installed Node JS and Express JS


How to use the logger
----------------------------

As an application middleware. Example:

 **var loggerService** = require('logger.service');  
 **module.exports = function (app) {  app.use(loggerService(loggerConfig)); }  **
 
 Logger config is an object with the following default properties:  
 
 **const defaultOptions** = {  
    storagePath: __dirname + '/logs',   
    logType: 'day',  
    logNameSeparator: '-'  
};  
**loggerConfig.storagePath** - Path for logs' storage. If path does not exist it will be created.  
**loggerConfig.logType** - Default value is **"day"**. Every day a new file will be created with the following name **"DD-MM-YYYY"**.   
**loggerConfig.logType** - **"hour"**. If this option is selected, a new folder will be created inside loggerConfig.storagePath for every day with the name **"DD-MM-YYYY"**. Filenames inside it will be **"DD-MM-YYYY-HH"**.  
**loggerConfig.logNameSeparator** - by default **'-'**. This is the separator used for file and directory names.  

**Note** - all dates are UTC format.

