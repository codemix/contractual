lib: src
	@./bin/contractual \
		--output ./lib \
		./src

test: lib
	@node ./node_modules/mocha/bin/mocha ./test/index.js ./test/*-test.js --reporter=spec

coverage:
	@./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha ./test/index.js ./test/*-test.js --reporter=spec

examples:
	@./bin/contractual \
		--output ./examples/compiled \
		./examples/src

.PHONY: test coverage examples lib