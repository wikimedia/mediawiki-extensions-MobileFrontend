.PHONY: less

less:
	lessc stylesheets/mf-settings.less > stylesheets/mf-settings.css

remotes:
	curl -Lo javascripts/externals/eventlog.js \
			"http://bits.wikimedia.org/static-1.20wmf12/extensions/E3Experiments/lib/event/eventlog.js"

