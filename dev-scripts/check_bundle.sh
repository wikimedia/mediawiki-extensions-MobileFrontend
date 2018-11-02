#!/usr/bin/env bash
# arguments: $0 - some parameters for the diff function (to tell script what to diff)
set -euo pipefail

git diff "$@" --name-only --exit-code resources/dist || {
	cat << eof
There are changes to resources/dist.

I will now check that you built them using the correct Node.js version v$(< .nvmrc).
Note: You are using $(node -v).
Building assets...
eof

	if [ "v$(cat .nvmrc)" != "$(node -v)" ]; then
			echo "You are not running the required node version"
			exit 1
	fi;
	npm -s run build
	git diff --name-status --exit-code resources/dist || {
			cat << 'eof'
After I built the assets, I noticed differences in the contents to what you committed.
Try running `npm run build` again or removing the node_modules folder and running npm install with the correct node version.
eof
			exit 1;
	}
	bundlesize
	echo 'Your changes look good!'
	exit 0;
}
echo 'There are no staged changes to the resources/dist folder in this change.'
echo 'Make sure to `npm run build` if this was not expected.'
