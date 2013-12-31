#!/usr/bin/env bash
if [ ! -e "scripts/remotes/gerrit.py" ]
then
	mkdir -p scripts/remotes
	echo 'Installing GerritCommandLine tool'
	curl -o scripts/remotes/gerrit.py https://raw.github.com/jdlrobson/GerritCommandLine/master/gerrit.py
	chmod +x scripts/remotes/gerrit.py
fi
