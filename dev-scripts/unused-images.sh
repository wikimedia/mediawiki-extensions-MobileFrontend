#!/bin/bash
exts=( png gif svg jpg jpeg )
cd stylesheets
for ext in "${exts[@]}"; do
	for file in `find . -name "*.$ext"`; do
		echo -n "Checking $file... "
		if grep -qr --exclude-dir=".git" "url(.*`basename "$file"`.*)"; then
			echo "used"
		else
			echo "not used, deleting"
			rm "$file"
		fi
	done
done
