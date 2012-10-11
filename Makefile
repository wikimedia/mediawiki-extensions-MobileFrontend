.PHONY: less

less:
	lessc stylesheets/less/specials/mf-settings.less > stylesheets/specials/mf-settings.css
	lessc stylesheets/less/common/mf-nav-ribbon.less > stylesheets/common/mf-nav-ribbon.css
	lessc stylesheets/less/common/mf-common.less > stylesheets/common/mf-common.css
	lessc stylesheets/less/common/mf-footer.less > stylesheets/common/mf-footer.css
	lessc stylesheets/less/common/mf-hacks.less > stylesheets/common/mf-hacks.css
	lessc stylesheets/less/common/mf-header.less > stylesheets/common/mf-header.css
	lessc stylesheets/less/common/mf-navigation-legacy.less > stylesheets/common/mf-navigation-legacy.css
	lessc stylesheets/less/common/mf-navigation.less > stylesheets/common/mf-navigation.css
	lessc stylesheets/less/modules/mf-toggle.less > stylesheets/modules/mf-toggle.css
	lessc stylesheets/less/modules/mf-search.less > stylesheets/modules/mf-search.css

remotes:
	curl -Lo javascripts/externals/eventlog.js \
			"http://bits.wikimedia.org/static-1.20wmf12/extensions/E3Experiments/lib/event/eventlog.js"

