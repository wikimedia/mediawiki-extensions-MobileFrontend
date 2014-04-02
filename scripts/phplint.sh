#!/usr/bin/env bash

command -v vendor/bin/phpcs >/dev/null 2>&1 || { echo >&2 "phpcs required but it's not installed. Aborting. Run 'make phpcheck'"; exit 1; }

if [ -z ${MEDIAWIKI_CODESNIFFER_CONFIG_DIR+x} ]
	then
		echo "MEDIAWIKI_CODESNIFFER_CONFIG_DIR is unset"
		echo "Please setup mediawiki/tools/codesniffer"
		echo "Then add 'export MEDIAWIKI_CODESNIFFER_CONFIG_DIR=path/MediaWiki'"
		exit 1
fi

for file in `find . -name '*.php' -not -path './node_modules/*' -not -path './vendor/*'`; do
	RESULTS=`php -l $file`
	if [ "$RESULTS" != "No syntax errors detected in $file" ]; then
		echo $RESULTS
		exit 1
	fi

	vendor/bin/phpcs $file --standard=$MEDIAWIKI_CODESNIFFER_CONFIG_DIR
	if [ $? -ne 0 ]; then
		exit 1
	fi
done

