# git-fish

[![Join the chat at https://gitter.im/jmervine/node-git-fish](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jmervine/node-git-fish?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/jmervine/node-git-fish.png?branch=master)](https://travis-ci.org/jmervine/node-git-fish) &nbsp; [![Dependancy Status](https://david-dm.org/jmervine/node-git-fish.png)](https://david-dm.org/jmervine/node-git-fish) &nbsp; [![NPM Version](https://badge.fury.io/js/git-fish.png)](https://badge.fury.io/js/git-fish)

### Github Web Hook Listener in Node.js

> Why fish? What recieves a hook?

### Usage

    $ gitfish help
    Usage: gitfish [forever options] action

     Gitfish Actions

       config   build initial config file
       start    start gitfish
       help     show this message

     Daemonized Actions

       stop     stop gitfish (when daemonized)
       restart  restart gitfish (when daemonized)
       status   status of gitfish (when de

     Optional Gitfish Options

       --daemonize : start gitfish daemonized
       --config    : default is `$CWD/config.json`
       --port      : overide port from config
       --token     : overide token from config

     Supported Forever Options

       --logFile [file] : forever log file location # default: /tmp/gitfish.log
       --outFile [file] : stdout file location      # default: forever log file
       --errFile [file] : stderr file location      # default: forever log file
       --pidFile [file] : pid file location         # default: /tmp/gitfish.pid
       --max     [n]    : max restarts on error
       --plain          : disable command line colors
       --verbose        : verbose forever output

     What is forever? https://github.com/nodejitsu/forever


#### Usage Examples

    $ npm install git-fish

    $ gitfish config
    Listener port? [8000]
    Security token? [secret]
    Hook endpoint? [script] /foo
    Hook script? [CWD/script.js]
    Hook branch filter?
    Saved configuration to /home/jmervine/config.json

    $ cat config.json
    {
      "port": 8000,
      "token": "secret",
      "foo": {
        "script": "/home/jmervine/script.js"
      }
    }

> Configuration note:
>
> `script` can be anything; `ruby`, `bash`, `python`, etc. It doesn't have to be a `node` script.

### Real World Config Example

> Important Note:
>
> `script` path must absolute and the script must be executable.

    {
      "port": 8001,
      "token": "shhh_do_not_tell_anyone",
      "prod": {
        "script": "/home/me/update_prod.sh",
        "branch": "master" // optional branch matcher
            // "branch" can also be an array of branches:
            // e.g. `[ "master", "develop" ]`
      },
      "dev": {
        "script": "/home/me/update_dev.sh",
        "branch": [ "release", "develop" ] // optional branch matcher
      }
    }

Where `/home/me/update_prod.sh` is something like:

    #!/usr/bin/env bash
    cd /path/to/mysite

    # For safty, you can stash any changes, although best practice says
    # there shouldn't be any here.
    # git stash

    git checkout master
    git pull

    make restart


And your post commit hooks would be:

    http://mysite:8001/prod?token=shhh_do_not_tell_anyone
    http://mysite:8001/dev?token=shhh_do_not_tell_anyone

## Contributors

* [davidbau](https://github.com/davidbau)

