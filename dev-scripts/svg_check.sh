#!/usr/bin/env bash
found=0

for svgfile in `find resources -type f -name "*.svg"`; do
	outfile="$svgfile.tmp"
	node_modules/.bin/svgo --config .svgo.config.js -i $svgfile -o $outfile -q
	if [ -f $outfile ]; then
		if [ $(wc -c $svgfile | awk '{print $1}') -gt $(wc -c $outfile | awk '{print $1}') ]; then
			echo "File $svgfile is not compressed."
			found=$((found + 1))
		fi
		rm $outfile
	fi
done

if [ $found -gt 0 ]; then
	echo "Found $found uncompressed SVG files. Please compress the files and re-submit the patch."
	exit 1
fi
