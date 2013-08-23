# Git Post Commit Hook in Node.js

> Why fish? What recieves a hook?


> Quick README, more to come!

### Install

```
npm install github jmervine/node-git-fish
```

### Use

```
node ./index.js [PATH TO CONFIG]
```


Testing the example:

```
$ nohup node ./index.js example.json &> log.log &
$ curl -X POST "http://localhost:8000/script?token=go-fish"
OK
$ curl -X POST "http://localhost:8000/command?token=go-fish"
OK
$ curl -X POST "http://localhost:8000/gofish?token=go-fish"
OK
$ cat log.log
nohup: ignoring input
woot! script!
woot! command!
you posted to /gofish
$ pkill -9 -f node
```

> Configuration node:
>
> If a given element has both `command` and `script`, `command` will always be executed over `script`. I'm considering supporting both, but don't really see the need for the use case at this time.
>
> Additionally, `script` can be anything; `ruby`, `bash`, `python`, etc. It doesn't have to be a `node` script.
