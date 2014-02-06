#!/usr/bin/env node

var test    = require('tape');
var http    = require('http');
var path    = require('path');
var fs      = require('fs');
var qs      = require('querystring');
var request = require('request-lite');
var config  = require(path.resolve(__dirname, 'test.json'));

var post_data = qs.stringify({
    "payload": {
        "ref": "ref/heads/master"
    }
});

var loggerBeQuiet = {
    info: function () {},
    warn: function () {},
    error: function () {}
};

require('../')({
    config: path.resolve(__dirname, 'test.json'),
    logger: loggerBeQuiet
});

function testRequest(t, code, endpoint, token, method, data, callback) {
    var options = {
        url: 'http://localhost:'+config.port+endpoint+'?token='+token,
        method: method,
        body: data
    };

    //if (data && (method === 'POST' || method === 'PUT')) {
        //options.body = data;
    //}

    request(options, function (error, response, _) {
        t.notOk(error, 'should not return error');
        t.ok(response, 'should have response');
        t.equal(code, response.statusCode, 'should have '+ code +' response');
        if (typeof callback === 'function') {
            callback();
        }
    });
}

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
        testRequest(t, 500, '/test1', config.token, 'POST', '');
    });

    g.test('bad path', function (t) {
        t.plan(3);
        testRequest(t, 404, '/bad', config.token, 'POST', post_data);
    });

    // Give tests 2 seconds to complete and then exit,
    // otherwise, the server process will hang.
    setTimeout( function () {
        process.exit();
    }, 2000);
});

function cleanup() {
    // cleanup
    if (fs.existsSync('/tmp/.git.fish.test.out')) {
        fs.unlinkSync('/tmp/.git.fish.test.out');
    }
}

