<?php
$wgRightsText = 'Creative Commons Attribution 3.0';
$wgRightsUrl = "http://creativecommons.org/licenses/by-sa/3.0/";
// Allow users to edit privacy link.
$wgGroupPermissions['user']['editinterface'] = true;


// Make languages.feature test work.
try {
	$dbw = wfGetDB( DB_MASTER );
	$dbw->insert( 'interwiki',
		array(
			'iw_prefix' => 'es',
			'iw_url' => 'http://wikifoo.org/es/index.php/$1',
			'iw_local' => 0,
			'iw_trans' => 0,
		)
	);
} catch ( Exception $e ) {
	// Pass - interwiki link already exists.
}
