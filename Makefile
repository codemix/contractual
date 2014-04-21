all:
	@mkdir -p ./lib
	@./node_modules/.bin/browserify \
		-o ./lib/index.js \
		./src/index.js

