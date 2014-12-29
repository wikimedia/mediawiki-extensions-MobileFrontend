<?php
if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

/**
 * ID of the App to deep link to replacing the browser. Set 'false' to have no such link.
 * See https://developers.google.com/app-indexing/webmasters/details
 */
$wgMFAppPackageId = false;

/**
 * Scheme to use for the deep link. Per default, 'http' is used.
 */
$wgMFAppScheme = 'http';
