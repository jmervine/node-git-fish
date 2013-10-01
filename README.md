# Git Post Commit Hook Listener in Node.js

> Why fish? What recieves a hook?


> Quick README, more to come!

### Usage

```
git clone https://github.com/jmervine/node-git-fish.git
cd node-git-fish
cp example.json config.json
node ./index.js [PATH TO CONFIG] # config.json is default
```


Testing the example:

```
$ git clone https://github.com/jmervine/node-git-fish.git
$ cd node-git-fish
$ nohup node ./index.js ./example.json &
$ curl -X POST "http://localhost:8000/script?token=go-fish"
OK
$ curl -X POST "http://localhost:8000/command?token=go-fish"
OK
$ curl -X POST "http://localhost:8000/gofish?token=go-fish"
OK
$ cat nohup.log
nohup: ignoring input
woot! script!
woot! command!
you posted to /gofish
$ pkill -9 -f "node ./index.js ./example.json"
```

> Configuration note:
>
> If a given element has both `command` and `script`, `command` will always be executed over `script`. I'm considering supporting both, but don't really see the need for the use case at this time.
>
> Additionally, `script` can be anything; `ruby`, `bash`, `python`, etc. It doesn't have to be a `node` script.

### Real World Config Example

``` json
{
  "port": 8001,
  "token": "shhh_do_not_tell_anyone",
  "mysite": {
    "script": "/home/me/update_mysite.sh",
    "branch": "develop" // optional branch matcher
  }
}
```

Where `/home/me/update_mysite.sh` is something like:

``` bash
#!/usr/bin/env bash
cd /path/to/mysite
git pull
```

And your post commit hook would be:

```
http://mysite:8001/mysite?token=shhh_do_not_tell_anyone
```

