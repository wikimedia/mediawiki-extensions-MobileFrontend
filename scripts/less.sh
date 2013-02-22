#!/usr/bin/env bash
if command -v npm > /dev/null ; then
  if npm list autoless | grep "(empty)" > /dev/null ; then
    echo "Installing autoless..."
    npm install autoless
  fi
  node_modules/.bin/autoless $1 stylesheets/less/ stylesheets/
else
  echo "You need to install Node.JS to compile LESS files!"
  echo "See http://nodejs.org/"
  exit 1
fi
