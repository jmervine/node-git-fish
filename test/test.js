#!/usr/bin/env node

var test    = require('tape');
var http    = require('http-debug').http;

var path    = require('path');
var fs      = require('fs');
var qs      = require('querystring');
var format  = require('util').format;
var request = require('request-lite');
var config  = require(path.resolve(__dirname, 'test.json'));

// supress output

var post_data = {
    "ref": "ref/heads/master"
}

var loggerBeQuiet = {
    info: function () {},
    warn: function () {},
    error: function () {}
};

// silence errors from gitfish
console.error = function () {};
console.trace = function () {};

process.env.TEST_CONFIG = path.resolve(__dirname, 'test.json');
process.env.TEST_PORT = 10888;
var server = require('../');


// TODO: This needs a serious look. It started out as a good idea
// and then ballooned.
function testRequest(t, opts, callback) {
    if (typeof opts === 'function') {
        callback = opts;
        opts = {};
    }

    // default to valid passing options
    opts.code = opts.code || 200;
    opts.endpoint = opts.endpoint || '/test1';
    opts.token = opts.token || config.token;
    opts.method = opts.method || 'POST';
    opts.data = opts.data || post_data;
    opts.form = opts.form || false;

    var url = format('http://localhost:%s%s?token=%s',
                        process.env.TEST_PORT,
                        opts.endpoint,
                        opts.token);

    function requestCallback(error, response, _) {
        t.error(error, format('%s %s with %s should not error',
                      opts.method, opts.endpoint, (opts.form ? 'form' : 'json')));

        t.ok(response, format('%s %s with %s should have response',
                      opts.method, opts.endpoint, (opts.form ? 'form' : 'json')));

        t.equal(response.statusCode, opts.code,
            format('%s %s with %s should have %s response',
                      opts.method, opts.endpoint, (opts.form ? 'form' : 'json'), opts.code));

        if (typeof callback === 'function') {
            callback();
        }
   }

    if (opts.method === 'POST') {
        if (opts.form) {
            request.post(url, requestCallback).form({ payload : JSON.stringify(opts.data) });
        } else {
            request.post(url, requestCallback).json(opts.data);
        }
    } else {
        request[opts.method.toLowerCase()](url, requestCallback);
    }
}

test('git fish', function (g) {

    g.test('test valid json', function (t) {
        t.plan(4);
        cleanup();
        testRequest(t, function() {
            setTimeout(function () {
                // give it a second
                t.ok(fs.existsSync('/tmp/.git.fish.test.out'), 'should run script');
                cleanup();
            }, 200);
        });
    });

    g.test('test valid form', function (t) {
        t.plan(4);
        cleanup();
        testRequest(t, { form: true }, function() {
            setTimeout(function () {
                // give it a second
                t.ok(fs.existsSync('/tmp/.git.fish.test.out'), 'should run script');
                cleanup();
            }, 200);
        });
    });

    g.test('bad token', function (t) {
        t.plan(3);
        testRequest(t, { code: 403, token: 'bad' });
    });

    g.test('bad method', function (t) {
        t.plan(3);
        testRequest(t, { code: 403, method: 'GET' });
    });

    g.test('bad data', function (t) {
        t.plan(3);
        testRequest(t, { code: 500, data: {} });
    });

    g.test('bad path', function (t) {
        t.plan(3);
        testRequest(t, { code: 404, endpoint: '/bad' });
    });

    // Give tests 2 seconds to complete and then exit,
    // otherwise, the server process will hang.
    setTimeout( function () {
        server.close();
    }, 2000);
});

function cleanup() {
    // cleanup
    if (fs.existsSync('/tmp/.git.fish.test.out')) {
        fs.unlinkSync('/tmp/.git.fish.test.out');
    }
}
