#!/usr/bin/env node
var path = require('path');
var express = require('express');
var app = express();

var config;
try {
    config = require(path.resolve(process.cwd(), (process.argv[2] || './config.json')));
} catch (e) {
    console.error('RTFM yo! You need a config file!');
    console.trace(e);
    process.exit(1);
}

config.port = config.port || 8000;

app.use(express.bodyParser());

app.get('/:endpoint', function (req, res) {
    console.log('Ack! Someone\'s trying to GET me!');
    res.send(403);
    return;
});

app.post('/:endpoint', function (req, res) {
    var endpoint = req.param('endpoint');
	console.log('Processing request: /%s', endpoint);
    if (req.query.token !== config.token) {
        res.send(403);
        return;
    }

    var ref;
    try {
        ref = JSON.parse(req.body.payload).ref;
    } catch (e) {
        console.log('Invalid request...');
        console.trace(e);
        res.send(500);
        return;
    }

    if (config[endpoint].branch && !ref.match(config[endpoint].branch)) {
        // Everything worked, but there's nothing to do here because
        // we didn't see the right branch.
        console.log('Skipping request: \n -> %s doesn\'t match %s', ref, config[endpoint].branch);
        res.send(200);
        return;
    }

    if (config[endpoint].command) {
        eval(config[endpoint].command);
        res.send(200);
        return;
    }

    if (config[endpoint].script) {
        console.log(' Running: \n -> %s', config[endpoint].script);
        require('child_process').spawn(path.resolve(process.cwd(),config[endpoint].script), [], {
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
