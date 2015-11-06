<?php
// Needs to be called within MediaWiki; not standalone
if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

/**
 * Define a set of params that should be passed in every gateway query.
 */
$wgMFSearchAPIParams = array(
	// https://phabricator.wikimedia.org/T115646
	'ppprop' => 'displaytitle',
);

/**
 * Define a set of page props that should be associated with requests for pages via the API.
 */
$wgMFQueryPropModules = array(
	'pageprops',
);

/**
 * Define the generator that should be used for mobile search.
 */
$wgMFSearchGenerator = array(
	'name' => 'prefixsearch',
	'prefix' => 'ps',
);
