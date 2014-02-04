#!/usr/bin/env node
var fs = require('fs');
fs.writeFile('/tmp/.git.fish.test.out', 'test', { encoding: 'utf-8' }, function (err) {
    if (err) {
        console.trace(err);
    }
});

