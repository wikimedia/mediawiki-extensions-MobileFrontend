minified:
	java -jar yuicompressor-2.4.6.jar javascripts/application.js -o javascripts/application.min.js
	java -jar yuicompressor-2.4.6.jar javascripts/banner.js -o javascripts/banner.min.js
	java -jar yuicompressor-2.4.6.jar javascripts/filepage.js -o javascripts/filepage.min.js
	java -jar yuicompressor-2.4.6.jar javascripts/toggle.js -o javascripts/toggle.min.js
	java -jar yuicompressor-2.4.6.jar javascripts/settings.js -o javascripts/settings.min.js
	java -jar yuicompressor-2.4.6.jar javascripts/references.js -o javascripts/references.min.js
	java -jar yuicompressor-2.4.6.jar javascripts/beta_opensearch.js -o javascripts/beta_opensearch.min.js
	java -jar yuicompressor-2.4.6.jar javascripts/mf-feedback.js -o javascripts/mf-feedback.min.js
