#!/bin/bash

# cachedpage.sh
#
# Usage: cachedpage.sh <rev> [title]
#
# Parameters:
#   rev    The revision of the Git commit that you want to check out in order to test the new assets
#          against. See https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection for a detailed
#          explanation of Git revision selection
#   title  The title of the page that you're testing [default: Main_Page]

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

HOST=${MEDIAWIKI_HOST:-"http://127.0.0.1:8080"}
TITLE=${2:="Main_Page"}

#Generate the 'cached' pages
mkdir -p tmp
echo "Using ${HOST} as a development environment host."
echo "To specify a different host set MEDIAWIKI_HOST environment variable"
echo '(e.g. by running "export MEDIAWIKI_HOST=http://127.0.0.1:80/")'
curl "${HOST}/wiki/${TITLE}?useformat=mobile" -o tmp/cached.html

#Return to previous branch
git checkout $cur_branch

# Print location of urls
echo
echo Cached page generated at following locations
echo
echo \* ${HOST}/w/extensions/MobileFrontend/tmp/cached.html

if [ $stashed_changes ]
then
	unset cur_branch
	git stash pop
fi
