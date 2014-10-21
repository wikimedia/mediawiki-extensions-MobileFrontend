#!/usr/bin/env bash

#usage ./dev-scripts/cachedpage.sh 1bd5bc53ebb04fff7f508712a29fdf1f1d7fe14f San_Francisco

if
! git diff --exit-code --quiet # check for unstaged changes
then #stash them so they are not lost
	stashed_changes=1
	git stash
fi

cur_branch=`git rev-parse --abbrev-ref HEAD` #get the current branch name
if [ $cur_branch == 'HEAD' ]
then #we should ensure we don't lose this
	cur_branch=tmp_`date "+%Y%m%d%H%M%S"`
	git branch -D $cur_branch #delete the temporary branch if it already exists
	git checkout -b $cur_branch #checkout the current HEAD as this new branch
fi

git checkout $1 #go to commit caller requested

#Generate the 'cached' pages
mkdir -p tmp
URL=${MEDIAWIKI_URL:-"http://127.0.0.1:8080/w/index.php/"}
TITLE=${2:="Main_Page"}
echo "Using $URL as a development environment host."
echo "To specify a different host set MEDIAWIKI_URL environment variable"
echo '(e.g. by running "export MEDIAWIKI_URL=http://127.0.0.1:80/w/index.php")'
wget "$URL$TITLE?useformat=mobile" -O tmp/cached.html

#Return to previous branch
git checkout $cur_branch

# Print location of urls
echo
echo Cached page generated at following locations
echo
echo \* $URL/extensions/MobileFrontend/tmp/cached.html

if [ $stashed_changes ]
then
	unset cur_branch
	git stash pop
fi
