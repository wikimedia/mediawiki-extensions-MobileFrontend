MW_INSTALL_PATH ?= ../..
MEDIAWIKI_LOAD_URL ?= http://localhost/w/load.php

gems:
	bundle install

clean:
	rm -Rf scripts/remotes
	rm -Rf docs

remotes:
	@scripts/remotecheck.sh

message:
	@scripts/message.py

# Requires GERRIT_USERNAME to be defined - lists patchsets you need to amend
mygerrit: remotes
	@scripts/remotes/gerrit.py --project 'mediawiki/extensions/MobileFrontend' --byuser ${GERRIT_USERNAME} --ltscore 0

gerrit: remotes
	@scripts/remotes/gerrit.py --project 'mediawiki/extensions/MobileFrontend' --gtscore -1

kss: nodecheck
	mkdir -p docs
	# FIXME: Use more up to date Ruby version
	$(eval KSS_MF_RL_TMP := $(shell mktemp /tmp/tmp.XXXXXXXXXX))
	curl -sG "${MEDIAWIKI_LOAD_URL}?modules=skins.minerva.chrome.styles|skins.minerva.content.styles|skins.minerva.drawers.styles|skins.minerva.buttons.styles|mobile.toast.styles|mobile.stable.styles|mobile.overlays|mobile.overlays.beta|mobile.pagelist.styles&only=styles" > $(KSS_MF_RL_TMP)
	@node_modules/.bin/kss-node less/ docs/styleguide/ --css $(KSS_MF_RL_TMP) -t styleguide-template
	@rm $(KSS_MF_RL_TMP)

jsduck: gems
	rm -rf docs/js
	jsduck javascripts/ --output docs/js/ --external=jQuery.Object,Hogan.Template,jQuery.Deferred --exclude=javascripts/external --ignore-global

docs: kss jsduck

nodecheck:
	@scripts/nodecheck.sh

jshinttests: nodecheck
	@node_modules/.bin/jshint tests/javascripts/* --config .jshintrc

jshint: nodecheck jshinttests
	@node_modules/.bin/jshint javascripts/* --config .jshintrc

dependencies: nodecheck phpcheck remotes

phpcheck:
	@scripts/phpcheck.sh

phplint: phpcheck
	@scripts/phplint.sh

phpunit:
	cd ${MW_INSTALL_PATH}/tests/phpunit && php phpunit.php --configuration ${MW_INSTALL_PATH}/extensions/MobileFrontend/tests/mfe.suite.xml --group=MobileFrontend

qunit:
	@scripts/qunit.sh

qunitdebug:
	@scripts/qunit.sh 'MobileFrontend&debug=true'

tests: jshint phpunit qunit

cucumber:
	@scripts/cucumber.sh

checkcucumber:
	@scripts/cucumber_check.sh

lint: jshint phplint checkcucumber

installhooks:
	ln -sf ${PWD}/scripts/pre-commit .git/hooks/pre-commit
	ln -sf ${PWD}/scripts/pre-review .git/hooks/pre-review

# user must create W3CValidationTest wiki page with text 'Hello world' for this to work
validatehtml:
	@scripts/validatehtml.sh
