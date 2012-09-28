.PHONY: less

less:
	lessc stylesheets/less/specials/mf-settings.less > stylesheets/specials/mf-settings.css
	lessc stylesheets/less/common/mf-nav-ribbon.less > stylesheets/common/mf-nav-ribbon.css

remotes:
	curl -Lo javascripts/externals/eventlog.js \
			"http://bits.wikimedia.org/static-1.20wmf12/extensions/E3Experiments/lib/event/eventlog.js"

