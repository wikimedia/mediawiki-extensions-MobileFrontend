#!/usr/bin/env bash
if [ ! -f composer.phar ]; then
	curl -sS https://getcomposer.org/installer | php
fi
php composer.phar install
