#!/usr/bin/env bash
echo "Running Cucumber tests..."
echo Please ensure you have a user account for User:Selenium_user
if command -v rvm > /dev/null ; then
  # FIXME: inconsistent MEDIAWIKI_URL
  URL=${MEDIAWIKI_URL:-"http://127.0.0.1:80/w/index.php/"}
  cd tests/acceptance
  bundle exec cucumber -f pretty
else
  echo "You need to install rvm and Ruby to run Cucumber tests!"
  echo "See http://rvm.io/"
  exit 1
fi
