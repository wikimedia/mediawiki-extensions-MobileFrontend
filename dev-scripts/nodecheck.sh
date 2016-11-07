#!/usr/bin/env bash
if command -v npm > /dev/null ; then
  if [ -n "$1" ] ; then
    echo "Install modules under $1"
    cd "$1"
  fi
  npm install
else
  echo "You need to install Node.JS and NPM!"
  echo "See http://nodejs.org/"
  exit 1
fi
