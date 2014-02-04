#!/usr/bin/env node
var http   = require('http');
var path   = require('path');
var logger = require('./lib/logger');
var spawn  = require('child_process').spawn;
var qs     = require('querystring');

module.exports = function(c) {

    if (c.logger) {
        logger = c.logger;
    }

    var config;
    try {
        config = require(path.resolve(process.cwd(), c.config));
    } catch (e) {
        logger.error('RTFM yo! You need a config file!');
        logger.error(e.stack);
        process.exit(1);
    }

    config.port = c.port || config.port || 8000;

    http.createServer(function (request, response) {

        var parts = request.url.split('?');

        request.pathname = parts[0];
        request.query    = qs.parse(parts[1]);

        if (request.method !== 'POST' ||
                request.query.token !== config.token) {
            logger.warn('Forbidden request: %s', request.url);
            response.writeHead(403, {'Content-Type': 'text/plain'});
            response.end('Forbidden 403\n');
            return;
        }

        var endpoint = request.pathname;
        if (endpoint.indexOf('/') === 0) {
            endpoint = endpoint.replace('/', '');
        }

        if (typeof config[endpoint] === 'undefined') {
            logger.error(new Error('404: Missing action: ' + endpoint).stack);
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.end('File Not Found 404\n');
            return;
        }

        var body = '';
        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            body = JSON.parse(body);

            var ref;
            try {
                ref = body.payload.ref;
            } catch (e) {
                logger.error('Invalid post:');
                logger.error(e.stack);
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.end('Application Error 500\n');
                return;
            }

            if (config[endpoint].branch &&
                    !ref.match(config[endpoint].branch)) {
                logger.warn('Skipping request:\n -> %s doesn\'t match %s',
                                ref, config[endpoint].branch);
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.end();
                return;
            }

            if (config[endpoint].script) {
                logger.info(' Running:\n -> %s', config[endpoint].script);
                spawn(path.resolve(process.cwd(), config[endpoint].script), [], {
                    detached: true,
                    stdio: 'inherit'
                });
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.end();
                return;
            }
        });

    }).listen(config.port);

    logger.info('Server running on port ', config.port);

    Object.keys(config).forEach(function (key) {
        if (key !== "token" && key !== "port") {
            logger.info(' -> /%s', key);
        }
    });

};

