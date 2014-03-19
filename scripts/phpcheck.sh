#!/bin/sh

# PHP Lint stuff before commiting
command -v phpcs >/dev/null 2>&1 || { echo >&2 "I require phpcs but it's not installed.  Aborting. Run `make dependencies`"; exit 1; }
if [ -z ${MEDIAWIKI_CODESNIFFER_CONFIG_DIR+x} ]
	then
		echo "@MEDIAWIKI_CODESNIFFER_CONFIG_DIR is unset"
		echo "Please setup mediawiki/tools/codesniffer"
		echo "Then add `export @MEDIAWIKI_CODESNIFFER_CONFIG_DIR=/path/`"
		exit 1
fi

for file in `find . -name \*.php -not -path './node_modules/*'`
do
	RESULTS=`php -l $file`
	if [ "$RESULTS" != "No syntax errors detected in $file" ]
		then
			echo $RESULTS
			exit 1
	fi
	RESULTS=`phpcs $file --standard=$MEDIAWIKI_CODESNIFFER_CONFIG_DIR`
	if [ "$RESULTS" != "" ]
		then
			echo "Problem with $file:"
			echo $RESULTS
			exit 1
	fi
done

