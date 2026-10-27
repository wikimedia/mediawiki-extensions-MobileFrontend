#!/usr/bin/env bash
set -euo pipefail

cat << eof
Checking the contents of resources/dist

Note: You are using $(node -v), .nvmrc has $(< .nvmrc).
Building assets...
eof

npm -s run build

git diff --name-status --exit-code resources/dist || {
	cat << 'eof'
After I built the assets, I noticed differences in the contents to what you committed.
Try running `npm run build` again or removing the node_modules folder and running npm install with the correct node version.
eof
	exit 1;
}

echo 'Your changes look good!'
exit 0;
