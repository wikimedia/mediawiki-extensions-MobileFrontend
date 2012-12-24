echo "Running QUnit tests..."
if command -v phantomjs > /dev/null ; then
  URL=${MEDIAWIKI_URL:-"http://127.0.0.1:80"}
  echo "Using $URL as a development environment host."
  echo "To specify a different host set MEDIAWIKI_URL environment variable"
  echo '(e.g. by running "export MEDIAWIKI_URL=http://localhost:8080/w")'
  phantomjs tests/externals/phantomjs-qunit-runner.js "$URL/index.php/Special:JavaScriptTest/qunit?filter=MobileFrontend"
else
  echo "You need to install PhantomJS to run QUnit tests in terminal!"
  echo "See http://phantomjs.org/"
  exit 1
fi
