MEDIAWIKI_LOAD_URL ?= http://localhost:8080/w/load.php
ifndef MW_INSTALL_PATH
$(error MW_INSTALL_PATH is not set. Please set it to your root mediawiki installation.)
endif

# From https://gist.github.com/prwhite/8168133
help:					## Show this help message
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

clean:					## Clean up build artefacts
	rm -Rf dev-scripts/remotes
	rm -Rf tests/report
	rm -Rf docs

remotes:
	@dev-scripts/remotecheck.sh

message: remotes			## Add or overwrites a message or verifies the integrity of the message files. Usage: make message add | make message check
	@python dev-scripts/remotes/message.py

mygerrit: remotes			## List patchsets that you need to amend
	@dev-scripts/remotes/gerrit.py --project 'mediawiki/extensions/MobileFrontend' --byuser ${GERRIT_USERNAME} --ltscore 0

gerrit: remotes				## List all patchsets
	@dev-scripts/remotes/gerrit.py --project 'mediawiki/extensions/MobileFrontend' --gtscore -1 --ignore 'WIP'

jsduck: nodecheck gems			## Build the JavaScript documentation
	@grunt docs --MW_INSTALL_PATH=${MW_INSTALL_PATH}

phpdoc: nodecheck			## Build the PHP documentation
	mkdir -p docs
	rm -rf docs/php
	mkdir -p docs/php/log
	@php node_modules/grunt-phpdocumentor/bin/phpDocumentor.phar -c phpdoc.xml

docs: jsduck phpdoc			## Build the styleguide, JavaScript, and PHP documentation

gems:
	bundle install

nodecheck:
	@dev-scripts/nodecheck.sh

jsbeautify: nodecheck			## Check the JavaScript coding style
	@find javascripts -type f -name "*.js" -not -path "**externals**" -exec node_modules/.bin/js-beautify -r {} \;

jscs: nodecheck			## Check the JavaScript coding style
	@grunt jscs

jshinttests: nodecheck			## Lint the QUnit tests
	@grunt jshint:tests

jshint: nodecheck 	## Lint the JavaScript files
	@grunt jshint

dependencies: nodecheck kssnodecheck phpcheck remotes

phpcheck:
	@dev-scripts/phpcheck.sh

phplint: phpcheck			## Lint the PHP files
	@php composer.phar test

phpunit:				## Run the PHPUnit test suite
	cd ${MW_INSTALL_PATH}/tests/phpunit && php phpunit.php --group MobileFrontend ${MW_INSTALL_PATH}/extensions/MobileFrontend/tests/phpunit

qunit:					## Run the QUnit test suite
	@grunt qunit:all

qunitdebug:				## Run the QUnit test suite in debug mode
	@QUNIT_DEBUG=true grunt qunit

tests: jshint phplint phpunit qunit	## Run the PHPUnit test suite and QUnit tests after linting them

cucumber: checkcucumber			## Run the browser test suite
	@dev-scripts/cucumber.sh

checkcucumber:
	@dev-scripts/cucumber_check.sh

lint: jshint phplint checkcucumber	## Lint all of the JavaScript, PHP, and browser test files

installhooks:				## Install the pre-commit and pre-review Git hooks
	ln -sf ${PWD}/dev-scripts/pre-commit .git/hooks/pre-commit
	ln -sf ${PWD}/dev-scripts/pre-review .git/hooks/pre-review

# user must create W3CValidationTest wiki page with text 'Hello world' for this to work
validatehtml:				## Validates the HTML output of the specified page with the W3C validator. Usage: make validatehtml <title>
	@dev-scripts/validatehtml.sh

releasenotes:
	@dev-scripts/release_notes $(from) $(to)
