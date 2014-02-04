# Git Post Commit Hook Listener in Node.js

> Why fish? What recieves a hook?

### Usage

```
$ gitfish help

USAGE: gitfish ACTION [CONFIG_FILE]

 Default CONFIG_FILE is <cwd>/config.json

 Actions:
 - run     :: start gitfish in current session
 - start   :: starts gitfish daemonized w/ forever
 - restart :: restarts gitfish daemon
 - stop    :: stops gitfish daemon
 - list    :: gitfish daemon information
```

#### Usage Examples

```
$ npm install -g github git://github.com/jmervine/node-git-fish.git

$ gitfish config
Listener port? [8000]
Security token? [secret]
Hook endpoint? [script] /foo
Hook script? [PWD/script.js]
Hook branch filter?
Saved configuration to /home/jmervine/config.json

$ cat config.json
{
  "port": 8000,
  "token": "secret",
  "foo": {
    "script": "/home/jmervine/Development/node-git-fish/script.js"
  }
}

$ gitfish start
info:    Forever processing file: gitfish.js

$ gitfish list
info:    Forever processes running
data:        uid  command       script     forever pid  logfile                                              uptime
data:    [0] uoCt /usr/bin/node gitfish.js 7231    7237 /home/jmervine/Development/node-git-fish/gitfish.log 0:0:0:3.811

$ gitfish stop
info:    Forever stopped process:
data:        uid  command       script     forever pid  logfile                                              uptime
[0] lb7w /usr/bin/node gitfish.js 7079    7085 /home/jmervine/Development/node-git-fish/gitfish.log 0:0:2:12.540
```

> Configuration note:
>
> `script` can be anything; `ruby`, `bash`, `python`, etc. It doesn't have to be a `node` script.

### Real World Config Example

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

