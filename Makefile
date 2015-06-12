MAKEFLAGS = -j1
BABEL_CMD = node_modules/babel/bin/babel

export NODE_ENV = test

.PHONY: clean build bootstrap build-core clean-core

build-core: clean-core
	node $(BABEL_CMD) src --out-dir lib --copy-files

clean-core:
	rm -rf lib

build:
	mkdir -p dist
	make build-core

	node tools/cache-templates

clean:
	rm -rf coverage templates.json test/tmp dist lib

bootstrap:
	npm list --global --depth 1 babel >/dev/null 2>&1 && npm uninstall -g babel || true
	npm install
	npm link
	cd packages/babel-cli && npm install && npm link && npm link babel-core
	git submodule update --init
	cd vendor/compat-table && npm install object-assign
	make build
