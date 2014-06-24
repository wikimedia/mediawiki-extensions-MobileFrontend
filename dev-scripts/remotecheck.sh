#!/usr/bin/env bash
if [ ! -e "dev-scripts/remotes/gerrit.py" ]
then
	mkdir -p dev-scripts/remotes
	echo 'Installing GerritCommandLine tool'
	curl -o dev-scripts/remotes/gerrit.py https://raw.githubusercontent.com/jdlrobson/GerritCommandLine/master/gerrit.py
	chmod +x dev-scripts/remotes/gerrit.py
fi
if [ ! -e "dev-scripts/remotes/message.py" ]
then
	mkdir -p dev-scripts/remotes
	echo 'Installing Message tool'
	curl -o dev-scripts/remotes/message.py https://raw.githubusercontent.com/jdlrobson/WikimediaMessageDevScript/master/message.py
	chmod +x dev-scripts/remotes/message.py
fi
