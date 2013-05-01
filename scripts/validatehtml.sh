#!/usr/bin/env bash
mkdir -p tmp
URL=${MEDIAWIKI_URL:-"http://127.0.0.1:80"}
curl -sG "$URL/index.php/W3CValidationTest?useformat=mobile" > tmp/validate.html
curl -sG "$URL/index.php/Special:MobileOptions?useformat=mobile" > tmp/validate_special.html
curl -sF "uploaded_file=@tmp/validate.html;type=text/html" -F output=json http://validator.w3.org/check > tmp/validate.json
curl -sF "uploaded_file=@tmp/validate_special.html;type=text/html" -F output=json http://validator.w3.org/check > tmp/validate_special.json

#check the validation results of a page in the main namespace
if grep -q '"type": "error"' tmp/validate_page.json
then
	num=`grep -c '"type": "error"' tmp/validate.json`
	echo $num validation errors found in main namespace page [see tmp/validate.json]
fi
#check the validation results of a page in the special namespace
if grep -q '"type": "error"' tmp/validate_special.json
then
	num=`grep -c '"type": "error"' tmp/validate_special.json`
	echo $num validation errors found in special page html markup [see tmp/validate_special.json]
fi
