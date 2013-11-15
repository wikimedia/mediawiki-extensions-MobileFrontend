#!/bin/sh

# PHP Lint stuff before commiting
for file in `find . -name \*.php`
do
	RESULTS=`php -l $file`
	if [ "$RESULTS" != "No syntax errors detected in $file" ]
		then
			echo $RESULTS
			exit 1
	fi
done
