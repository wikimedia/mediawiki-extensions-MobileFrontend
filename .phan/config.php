<?php

$cfg = require __DIR__ . '/../vendor/mediawiki/mediawiki-phan-config/src/config.php';

$cfg['directory_list'] = array_merge(
	$cfg['directory_list'],
	[
		'../../extensions/AbuseFilter',
		'../../extensions/CentralAuth',
		'../../extensions/LiquidThreads',
		'../../extensions/PageImages',
		'../../extensions/XAnalytics',
		'../../extensions/Wikibase/client',
		'../../extensions/Wikibase/lib',
	]
);

$cfg['exclude_analysis_directory_list'] = array_merge(
	$cfg['exclude_analysis_directory_list'],
	[
		'../../extensions/AbuseFilter',
		'../../extensions/CentralAuth',
		'../../extensions/LiquidThreads',
		'../../extensions/PageImages',
		'../../extensions/XAnalytics',
		'../../extensions/Wikibase/client',
		'../../extensions/Wikibase/lib',
	]
);

return $cfg;
