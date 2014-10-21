#!/usr/bin/env bash
echo "Running QUnit tests..."
if command -v phantomjs > /dev/null ; then
  URL=${MEDIAWIKI_URL:-"http://127.0.0.1:8080/w/index.php/"}
  if [ -z "$1" ]; then
    FILTER=""
  else
    FILTER="&filter=$1"
  fi
  echo "Using $URL as a development environment host."
  echo "Please ensure \$wgEnableJavaScriptTest = true; in your LocalSettings.php"
  echo "To specify a different host set MEDIAWIKI_URL environment variable"
  echo '(e.g. by running "export MEDIAWIKI_URL=http://127.0.0.1:80/w/index.php/")'
  results=$(phantomjs tests/externals/phantomjs-qunit-runner.js "${URL}Special:JavaScriptTest/qunit?useformat=mobile$FILTER")
	#Set the field separator to new line
	IFS=$'\n'
	# Iterate through each line
	for item in $results
	do
		# Only print useful lines, don't print any with long urls in them
		if [[ $item != *at\ http* && \
				$item != *at\ process\ \(* && \
				$item != *at\ runScript\ \(* && \
				$item != *at\ execute\ \(* && \
				$item != *at\ handlePending\ \(* ]]
		then
		  echo $item
		fi
	done
else
  echo "You need to install PhantomJS to run QUnit tests in terminal!"
  echo "See http://phantomjs.org/"
  exit 1
fi
