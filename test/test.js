#!/usr/bin/env node

var test    = require('tape');
var http    = require('http');
var path    = require('path');
var fs      = require('fs');
var format  = require('util').format;
var request = require('request-lite');
var config  = require(path.resolve(__dirname, 'test.json'));

// supress output

var post_data = {
    "payload": {
        "ref": "ref/heads/master"
    }
};

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

function testRequest(t, code, endpoint, token, method, data, callback) {
    var url = format('http://localhost:%s%s?token=%s',
                        process.env.TEST_PORT,
                        endpoint,
                        token);

    function requestCallback(error, response, _) {
        t.error(error, 'should not return error',
            format('%s %s should have %s response',
                      method, endpoint, code));
        t.ok(response, 'should have response',
            format('%s %s should have %s response',
                      method, endpoint, code));

        t.equal(response.statusCode, code,
            format('%s %s should have %s response',
                      method, endpoint, code));

        if (typeof callback === 'function') {
            callback();
        }
    }

    if (method === 'POST') {
        request.post(url, requestCallback).json(data);
    } else {
        request[method.toLowerCase()](url, requestCallback);
    }
}

//var test = tape.createHarness();

test('git fish', function (g) {

    g.test('test valid', function (t) {
        t.plan(4);
        cleanup();
        testRequest(t, 200, '/test1', config.token, 'POST', post_data, function() {
            setTimeout(function () {
                // give it a second
                t.ok(fs.existsSync('/tmp/.git.fish.test.out'), 'should run script');
                cleanup();
            }, 200);
        });
    });

    g.test('bad token', function (t) {
        t.plan(3);
        testRequest(t, 403, '/test1', 'bad', 'POST', post_data);
    });

    g.test('bad method', function (t) {
        t.plan(3);
        testRequest(t, 403, '/test1', config.token, 'GET', post_data);
    });

    g.test('bad data', function (t) {
        t.plan(3);
        testRequest(t, 500, '/test1', config.token, 'POST', {});
    });

    g.test('bad path', function (t) {
        t.plan(3);
        testRequest(t, 404, '/bad', config.token, 'POST', post_data);
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

