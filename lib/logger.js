var winston   = require('winston');
var transport = new (winston.transports.Console)({ json: false, timestamp: true });
var logger    = new (winston.Logger)({
    level: 'info',
    json: false,
    timestamp: true,
    exitOnError: false,
    transports: [ transport ]
});

module.exports = logger;

