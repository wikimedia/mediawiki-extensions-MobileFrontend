#!/usr/bin/env bash
mkdir -p tmp
TITLE=${1:-"W3CValidationTest"}
URL=${MEDIAWIKI_URL:-"http://127.0.0.1:8080/w/index.php/"}
curl -sG "$URL$TITLE?useformat=mobile" > tmp/validate.html
curl -sF "uploaded_file=@tmp/validate.html;type=text/html" -F output=json http://validator.w3.org/check > tmp/validate.json

#check the validation results of a page in the main namespace
if grep -q '"type": "error"' tmp/validate.json
then
	num=`grep -c '"type": "error"' tmp/validate.json`
	echo $num validation errors found in main namespace page [see tmp/validate.json]
fi

# if no parameter was set do a special page check as well
if [ -z "$1" ]; then
	curl -sG "${URL}Special:MobileOptions?useformat=mobile" > tmp/validate_special.html
	curl -sF "uploaded_file=@tmp/validate_special.html;type=text/html" -F output=json http://validator.w3.org/check > tmp/validate_special.json
	#check the validation results of a page in the special namespace
	if grep -q '"type": "error"' tmp/validate_special.json
	then
		num=`grep -c '"type": "error"' tmp/validate_special.json`
		echo $num validation errors found in special page html markup [see tmp/validate_special.json]
	fi
fi #end if parameter not set do this test
