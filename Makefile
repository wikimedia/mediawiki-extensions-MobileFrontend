MW_INSTALL_PATH ?= ../..

.PHONY: less

jshinttests:
	jshint tests/javascripts/* --config .jshintrc

jshint: jshinttests
	jshint javascripts/* --config .jshintrc

less:
	@scripts/less.sh --no-watch

lesswatch:
	@scripts/less.sh

phpunit:
	cd ${MW_INSTALL_PATH}/tests/phpunit && php phpunit.php --configuration ${MW_INSTALL_PATH}/extensions/MobileFrontend/tests/mfe.suite.xml --group=MobileFrontend

qunit:
	@scripts/qunit.sh

tests: jshint phpunit qunit

installhooks:
	ln -sf ${PWD}/scripts/pre-commit .git/hooks/pre-commit
	ln -sf ${PWD}/scripts/pre-rebase .git/hooks/pre-rebase
	ln -sf ${PWD}/scripts/post-rewrite .git/hooks/post-rewrite

# user must create W3CValidationTest wiki page with text 'Hello world' for this to work
validatehtml:
	@scripts/validatehtml.sh
