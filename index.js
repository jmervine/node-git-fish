#!/usr/bin/env node
var http   = require('http');
var path   = require('path');
var spawn  = require('child_process').spawn;
var qs     = require('querystring');
var subarg = require('subarg');
var argv = subarg(process.argv.slice(2));

/***
 * Anything in example.json can be passed via
 * commandline args, e.g.:
 *
 * $ index.js --port 3000 --config foo.json --token go-fish \
 *      --gofish [ --script "./test/script.js", --branch "master" ]
 *
 *  See `subarg` (https://github.com/substack/subarg) for details on how
 *  this works.
 ***/

var config;
try {
    config = require(path.resolve(process.env.TEST_CONFIG||argv.config||'config.json'));
} catch (e) {
    console.error('RTFM yo! You need a config file!');
    console.trace(e);
    process.exit(1);
}

config.port = process.env.TEST_PORT || argv.port || config.port || 8000;

var server = http.createServer(function (request, response) {

    var json = (request.headers['content-type'] === 'application/json' ||
                    request.headers['Content-Type'] === 'applciation/json');

    var parts = request.url.split('?');

    request.pathname = parts[0];
    request.query    = qs.parse(parts[1]);

    if (request.method !== 'POST' ||
            request.query.token !== config.token) {
        console.error('Forbidden request: %s', request.url);
        response.writeHead(403, {'Content-Type': 'text/plain'});
        response.end('Forbidden 403\n');
        return;
    }

    var endpoint = request.pathname;
    if (endpoint.indexOf('/') === 0) {
        endpoint = endpoint.replace('/', '');
    }

    if (typeof config[endpoint] === 'undefined') {
        console.trace(new Error('404: Missing action: ' + endpoint));
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('File Not Found 404\n');
        return;
    }

    var body = '';
    request.on('data', function (data) {
        body += data;
    });

    request.on('end', function () {
        if (json) {
            body = JSON.parse(body);
        } else {
            body = qs.parse(body);
            Object.keys(body).forEach(function (key) {
                try {
                    body[key] = JSON.parse(body[key]);
                } catch (e) {
                    // don't fail on content that doesn't parse
                }
            });
            body = body.payload;
        }

        if (body.zen) {
            // Handle github ping by bouncing the zen.
            console.log('Got ping from ' +
                (body.hook && body.hook.url) + ': ' + body.zen);
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end(body.zen);
            return;
        }

        // Github hooks report the branch name in body.ref.
        // Travis hooks report the branch name in body.branch.
        var ref = body.ref || body.branch;
        if (typeof ref === 'undefined') {
            console.error('Invalid post:');
            console.trace(new Error(body));
            response.writeHead(500, {'Content-Type': 'text/plain'});
            response.end('Application Error 500\n');
            return;
        }

        var branch = config[endpoint].branch;
        if (branch) {
            var skip = function() {
                console.warn('Skipping request:\n -> %s doesn\'t match %s', ref, branch);
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.end();
            };

            if (Array.isArray(branch)) {
                if (!branch.some(function(i) { return ref.match(i) })) return skip();
            } else {
                if (!ref.match(branch)) return skip();
            }

        }

        if (config[endpoint].script) {
            console.log(' Running:\n -> %s', config[endpoint].script);
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

console.log('Server running on port ', config.port);

Object.keys(config).forEach(function (key) {
    if (key !== "token" && key !== "port") {
        console.log(' -> /%s', key);
    }
});

module.exports = server;
