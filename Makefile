MW_INSTALL_PATH ?= ../..
MEDIAWIKI_LOAD_URL ?= http://localhost:8080/w/load.php

# From https://gist.github.com/prwhite/8168133
help:					## Show this help message
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

clean:					## Clean up build artefacts
	rm -Rf dev-scripts/remotes
	rm -Rf docs

remotes:
	@dev-scripts/remotecheck.sh

message: remotes			## Add or overwrites a message or verifies the integrity of the message files. Usage: make message add | make message check
	@python dev-scripts/remotes/message.py

mygerrit: remotes			## List patchsets that you need to amend
	@dev-scripts/remotes/gerrit.py --project 'mediawiki/extensions/MobileFrontend' --byuser ${GERRIT_USERNAME} --ltscore 0

gerrit: remotes				## List all patchsets
	@dev-scripts/remotes/gerrit.py --project 'mediawiki/extensions/MobileFrontend' --gtscore -1 --ignore 'WIP'

kss: kssnodecheck			## Build the styleguide
	mkdir -p docs
	# FIXME: Use more up to date Ruby version
	$(eval KSS_MF_RL_TMP := $(shell mktemp /tmp/tmp.XXXXXXXXXX))
	curl -sG "${MEDIAWIKI_LOAD_URL}?modules=skins.minerva.chrome.styles|skins.minerva.content.styles|skins.minerva.drawers.styles|mobile.toast.styles|mobile.stable.styles|mobile.overlays|mobile.overlays.beta|mobile.pagelist.styles&only=styles" > $(KSS_MF_RL_TMP)
	@node_modules/.bin/kss-node less/ docs/styleguide/ --css $(KSS_MF_RL_TMP) -t styleguide-template
	@rm $(KSS_MF_RL_TMP)

jsduck: gems				## Build the JavaScript documentation
	rm -rf docs/js
	mkdir -p docs
	jsduck ${MW_INSTALL_PATH}/extensions/Mantle/javascripts/ javascripts/ \
		--output docs/js/ \
		--warnings-exit-nonzero \
		--external=OO.EventEmitter,jQuery.Object,Hogan.Template,HandleBars.Template,jQuery.Deferred,jQuery.Event,mw.user \
		--exclude=javascripts/external \
		--ignore-global \
		--warnings=nodoc

phpdoc: nodecheck			## Build the PHP documentation
	mkdir -p docs
	rm -rf docs/php
	mkdir -p docs/php/log
	@php node_modules/grunt-phpdocumentor/bin/phpDocumentor.phar -c phpdoc.xml

docs: kss jsduck phpdoc			## Build the styleguide, JavaScript, and PHP documentation

kssnodecheck:
	@dev-scripts/kss-node-check.sh

gems:
	bundle install

nodecheck:
	@dev-scripts/nodecheck.sh

jsbeautify: nodecheck			## Check the JavaScript coding style
	@find javascripts -type f -name "*.js" -not -path "**externals**" -exec node_modules/.bin/js-beautify -r {} \;

jscs: nodecheck			## Check the JavaScript coding style
	@grunt jscs:main

jscsdoc: nodecheck			## Check the JavaScript coding style documentation
	@grunt jscs:doc

jshinttests: nodecheck			## Lint the QUnit tests
	@grunt jshint:tests

jshint: nodecheck 	## Lint the JavaScript files
	@grunt jshint

dependencies: nodecheck kssnodecheck phpcheck remotes

phpcheck:
	@dev-scripts/phpcheck.sh

phplint: phpcheck			## Lint the PHP files
	@dev-scripts/phplint.sh

phpunit:				## Run the PHPUnit test suite
	cd ${MW_INSTALL_PATH}/tests/phpunit && php phpunit.php --configuration ${MW_INSTALL_PATH}/extensions/MobileFrontend/tests/phpunit/mfe.suite.xml --group=MobileFrontend

qunit:					## Run the QUnit test suite
	@dev-scripts/qunit.sh

qunitdebug:				## Run the QUnit test suite in debug mode
	@dev-scripts/qunit.sh 'MobileFrontend&debug=true'

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
