lib: src
	@./bin/contractual \
		--output ./lib \
		./src

test: lib
	@node ./node_modules/mocha/bin/mocha ./test/index.js ./test/*-test.js --reporter=spec

.PHONY: test