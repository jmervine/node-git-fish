#!/usr/bin/env node

var tape    = require('tape');
var http    = require('http-debug').http;
var path    = require('path');
var fs      = require('fs');
var qs      = require('querystring');
var format  = require('util').format;
var request = require('request-lite');

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
var server = require('../gitfish');

tape('git fish', function (group) {

    group.test('test valid json', function (test) {
        request.post('http://localhost:10888/test1?token=go-fish', { json: post_data }, function(err, res, body) {
            test.error(err, 'should not error')
            test.ok(res, 'should return response');
            test.equal(res.statusCode, 200, 'should return 200');
            setTimeout(function () {
                // give it a second
                test.ok(fs.existsSync('/tmp/.git.fish.test.out'), 'should run script');
                cleanup();
                test.end();
            }, 200);
        });
    });

    group.test('test valid form', function (test) {
        request.post('http://localhost:10888/test1?token=go-fish', { form: { payload: JSON.stringify(post_data) } }, function(err, res, body) {
            test.error(err, 'should not error')
            test.ok(res, 'should return response');
            test.equal(res.statusCode, 200, 'should return 200');
            setTimeout(function () {
                // give it a second
                test.ok(fs.existsSync('/tmp/.git.fish.test.out'), 'should run script');
                cleanup();
                test.end();
            }, 200);
        });
    });

    group.test('bad method', function (test) {
        request.post('http://localhost:10888/test1?token=badtoken', { json: post_data }, function(err, res, body) {
            test.error(err, 'should not error')
            test.ok(res, 'should return response');
            test.equal(res.statusCode, 403, 'should return 403');
            test.end();
        });
    });

    group.test('bad method', function (test) {
        request.put('http://localhost:10888/test1?token=go-fish', { json: post_data }, function(err, res, body) {
            test.error(err, 'should not error')
            test.ok(res, 'should return response');
            test.equal(res.statusCode, 403, 'should return 403');
            test.end();
        });
    });

    group.test('bad data', function (test) {
        request.post('http://localhost:10888/test1?token=go-fish', { json: { bad: 'data' } }, function(err, res, body) {
            test.error(err, 'should not error')
            test.ok(res, 'should return response');
            test.equal(res.statusCode, 500, 'should return 500');
            test.end();
        });
    });

    group.test('bad path', function (test) {
        request.post('http://localhost:10888/bad?token=go-fish', { json: post_data }, function(err, res, body) {
            test.error(err, 'should not error')
            test.ok(res, 'should return response');
            test.equal(res.statusCode, 404, 'should return 500');
            test.end();
        });
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
