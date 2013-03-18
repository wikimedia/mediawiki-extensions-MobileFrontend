.PHONY: less

jshinttests:
	jshint tests/js/* --config .jshintrc

jshint: jshinttests
	jshint javascripts/* --config .jshintrc

less:
	@scripts/less.sh --no-watch

lesswatch:
	@scripts/less.sh

phpunit:
	cd ../../tests/phpunit && php phpunit.php --configuration ../../extensions/MobileFrontend/tests/mfe.suite.xml --group=MobileFrontend

qunit:
	@tests/qunit.sh

tests: jshint phpunit qunit

installhooks:
	ln -sf ${PWD}/scripts/pre-commit .git/hooks/pre-commit
	ln -sf ${PWD}/scripts/pre-rebase .git/hooks/pre-rebase
	ln -sf ${PWD}/scripts/post-rewrite .git/hooks/post-rewrite
