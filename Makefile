test:
	node tests/github-file-tests.js

pushall:
	git push origin master && npm publish

lint:
	./node_modules/.bin/eslint .
