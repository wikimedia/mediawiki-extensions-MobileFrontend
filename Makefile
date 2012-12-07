.PHONY: less

jshinttests:
	jshint tests/js/*

jshint: jshinttests
	jshint javascripts/actions/* javascripts/common/* javascripts/desktop/* \
		javascripts/modules/* javascripts/specials/* --config .jshintrc

less:
	lessc stylesheets/less/specials/mf-settings.less > stylesheets/specials/mf-settings.css
	lessc stylesheets/less/specials/mf-login.less > stylesheets/specials/mf-login.css
	lessc stylesheets/less/common/mf-common.less > stylesheets/common/mf-common.css
	lessc stylesheets/less/common/mf-footer.less > stylesheets/common/mf-footer.css
	lessc stylesheets/less/common/mf-hacks.less > stylesheets/common/mf-hacks.css
	lessc stylesheets/less/common/mf-enwp.less > stylesheets/common/mf-enwp.css
	lessc stylesheets/less/common/mf-navigation.less > stylesheets/common/mf-navigation.css
	lessc stylesheets/less/modules/mf-cleanuptemplates.less > stylesheets/modules/mf-cleanuptemplates.css
	lessc stylesheets/less/modules/mf-banner.less > stylesheets/modules/mf-banner.css
	lessc stylesheets/less/modules/mf-toggle.less > stylesheets/modules/mf-toggle.css
	lessc stylesheets/less/modules/mf-search.less > stylesheets/modules/mf-search.css
	lessc stylesheets/less/modules/mf-watchlist.less > stylesheets/modules/mf-watchlist.css
	lessc stylesheets/less/modules/mf-random.less > stylesheets/modules/mf-random.css
	lessc stylesheets/less/modules/mf-tables.less > stylesheets/modules/mf-tables.css
	lessc stylesheets/less/modules/mf-photo.less > stylesheets/modules/mf-photo.css
	lessc stylesheets/less/common/mf-typography.less > stylesheets/common/mf-typography.css
	lessc stylesheets/less/actions/mf-edit.less > stylesheets/actions/mf-edit.css
	lessc stylesheets/less/actions/mf-history.less > stylesheets/actions/mf-history.css
	lessc stylesheets/less/specials/watchlist.less > stylesheets/specials/watchlist.css

remotes:
	curl -Lo javascripts/externals/eventlog.js \
			"http://bits.wikimedia.org/en.wikipedia.org/load.php?modules=ext.Experiments.eventlog"

phpunit:
	cd ../../tests/phpunit && php phpunit.php --configuration ../../extensions/MobileFrontend/tests/mfe.suite.xml

qunit:
	open http://localhost/w/index.php/Special:JavaScriptTest/qunit?filter=MobileFrontend

tests: jshint phpunit qunit
