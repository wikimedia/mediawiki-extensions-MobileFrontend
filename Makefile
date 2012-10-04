.PHONY: less

less:
	lessc stylesheets/less/specials/mf-settings.less > stylesheets/specials/mf-settings.css

remotes:
	curl -Lo javascripts/externals/eventlog.js \
			"http://bits.wikimedia.org/static-1.20wmf12/extensions/E3Experiments/lib/event/eventlog.js"

