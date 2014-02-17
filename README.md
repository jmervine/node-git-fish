# Git Post Commit Hook Listener in Node.js

> Why fish? What recieves a hook?

### Usage

```
$ gitfish help

Usage: gitfish [forever options] action

 Gitfish Actions

   start
   stop
   restart
   status
   help

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

```

#### Usage Examples

```
$ npm install -g github git://github.com/jmervine/node-git-fish.git

# TODO:
#
# $ gitfish config
# Listener port? [8000]
# Security token? [secret]
# Hook endpoint? [script] /foo
# Hook script? [CWD/script.js]
# Hook branch filter?
# Saved configuration to /home/jmervine/config.json
#
# $ cat config.json
# {
#   "port": 8000,
#   "token": "secret",
#   "foo": {
#     "script": "/home/jmervine/Development/node-git-fish/script.js"
#   }
# }
```

> Configuration note:
>
> `script` can be anything; `ruby`, `bash`, `python`, etc. It doesn't have to be a `node` script.

### Real World Config Example

> Important Note:
>
> `script` path must absolute and the script must be executable.

``` json
{
  "port": 8001,
  "token": "shhh_do_not_tell_anyone",
  "prod": {
    "script": "/home/me/update_prod.sh",
    "branch": "master" // optional branch matcher
  },
  "dev": {
    "script": "/home/me/update_dev.sh",
    "branch": "develop" // optional branch matcher
  }
}
```

Where `/home/me/update_prod.sh` is something like:

``` bash
#!/usr/bin/env bash
cd /path/to/mysite
git checkout master
git pull
```

And your post commit hooks would be:

```
http://mysite:8001/prod?token=shhh_do_not_tell_anyone
http://mysite:8001/dev?token=shhh_do_not_tell_anyone
```

