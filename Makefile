MW_INSTALL_PATH ?= ../..

clean:
	rm -Rf scripts/remotes

remotes:
	@scripts/remotecheck.sh

# Requires GERRIT_USERNAME to be defined - lists patchsets you need to amend
mygerrit: remotes
	@scripts/remotes/gerrit.py --project 'mediawiki/extensions/MobileFrontend' --byuser ${GERRIT_USERNAME} --ltscore 0

gerrit: remotes
	@scripts/remotes/gerrit.py --project 'mediawiki/extensions/MobileFrontend' --gtscore -1

kss: nodecheck
	# FIXME: Use more up to date Ruby version
	@node_modules/.bin/kss-node less/ less/ -l less/mobile.less -t styleguide-template

nodecheck:
	@scripts/nodecheck.sh

jshinttests: nodecheck
	@node_modules/.bin/jshint tests/javascripts/* --config .jshintrc

jshint: nodecheck jshinttests
	@node_modules/.bin/jshint javascripts/* --config .jshintrc

checkless:
	@php ../../maintenance/checkLess.php

phplint:
	@scripts/phpcheck.sh

phpunit:
	cd ${MW_INSTALL_PATH}/tests/phpunit && php phpunit.php --configuration ${MW_INSTALL_PATH}/extensions/MobileFrontend/tests/mfe.suite.xml --group=MobileFrontend

qunit:
	@scripts/qunit.sh

qunitdebug:
	@scripts/qunit.sh 'MobileFrontend&debug=true'

tests: jshint phpunit qunit

cucumber:
	@scripts/cucumber.sh

installhooks:
	ln -sf ${PWD}/scripts/pre-commit .git/hooks/pre-commit

# user must create W3CValidationTest wiki page with text 'Hello world' for this to work
validatehtml:
	@scripts/validatehtml.sh
