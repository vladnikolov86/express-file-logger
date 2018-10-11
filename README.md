

Prerequisites
-----------
Installed Node JS version 7.6 and above and Express JS


How to use the logger
----------------------------

As an application middleware. Example:  
 ```json
const app = express(); 
const loggerService = require('expressjs-file-logger');  

app.use(loggerService(loggerConfig));
 ```
 
 Logger config is an object with the following default properties. Any of them could be overriden:  
 ```json
 const defaultOptions = {  
    storagePath: process.cwd() + '/logs',   
    logType: 'day',  
    logNameSeparator: '-',  
    logMode: 'all',  
    logRequestBody: true,  
    logFilesExtension: '.txt'  
};  
 ```
**loggerConfig.storagePath** - Path for logs' storage. If path does not exist it will be created.  

**loggerConfig.logType** - Default value is **'day'**. Every day a new file will be created with the following name **'DD-MM-YYYY'**.   
**loggerConfig.logType** - **'hour'**. If this option is selected, a new folder will be created inside loggerConfig.storagePath for every day with the name **'DD-MM-YYYY'**. Filenames inside it will be **'DD-MM-YYYY-HH'**.  

**loggerConfig.logNameSeparator** - by default **'-'**. This is the separator used for file and directory names.  
**loggerConfig.logMode** - by default **'all'**, logger will log every request. If set to **'errors'**, it will log only 400 and above status codes.  
**loggerConfig.logRequestBody** - by default **true**, logger will log every request's body. If set to **false**, it will log only status code and status message.  
**loggerConfig.logRequestBody** - by default **.txt**. Files will be saved with '.txt' extension. Could be overriden to '.log' or any other appropriate fromat.  

**Note** - all dates are UTC format. Module uses async/await so Node JS version should support it
