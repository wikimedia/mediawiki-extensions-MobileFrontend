#!/usr/bin/env bash

# http://rvm.io/workflow/scripting
# Load RVM into a shell session *as a function*
if [[ -s "$HOME/.rvm/scripts/rvm" ]] ; then
  # First try to load from a user install
  source "$HOME/.rvm/scripts/rvm"
elif [[ -s "/usr/local/rvm/scripts/rvm" ]] ; then
  # Then try to load from a root install
  source "/usr/local/rvm/scripts/rvm"
else
  echo "You need to install rvm and Ruby to run Cucumber tests!"
  echo "See http://rvm.io/"
  exit 1
fi

# http://stackoverflow.com/a/246128/365238
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Checking required dependencies..."
cd "$DIR/../tests/browser"
bundle install
echo "Running Cucumber tests..."
echo "Please ensure you have a user account for User:Selenium_user"
bundle exec cucumber -f pretty
