es5:
	./node_modules/.bin/babel --presets=es2015 index-es6.js > index.js

test: es5
	node tests/github-file-tests.js

pushall:
	npm publish && git push origin master

lint:
	./node_modules/.bin/eslint .
