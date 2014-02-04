setup:
	npm install

clean:
	rm -rf node_modules

run:
	node ./index.js example.json

start:
	nohup node ./index.js ./config.json &

stop:
	pkill -9 -f "node ./index.js ./config.json"