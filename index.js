var path = require('path');
var express = require('express');
var app = express();

var config;
try {
    config = require(path.resolve(__dirname, (process.argv[2] || './config.json')));
} catch (e) {
    console.error('RTFM yo! You need a config file!');
    console.trace(e);
    process.exit(1);
}

config.port = config.port || 8000;

app.post('/:endpoint', function (req, res) {
    var endpoint = req.param('endpoint');
    if (req.query.token !== config.token) {
        res.send(403);
        return;
    }
    if (config[endpoint].command) {
        eval(config[endpoint].command);
        res.send(200);
        return;
    }
    if (config[endpoint].script) {
        require('child_process').spawn(path.resolve(__dirname,config[endpoint].script), [], {
            detached: true,
            stdio: 'inherit'
        });
        res.send(200);
        return;
    }
    console.trace(new Error('Missing action.'));
    res.send(500);
});

console.log('Starting on port: %s', config.port);

Object.keys(config).forEach(function (key) {
    if (key !== "token" && key !== "port") {
        console.log(' -> /%s', key);
    }
});


app.listen(config.port);
