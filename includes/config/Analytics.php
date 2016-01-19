<?php
if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

/**
 * Whether or not to enable the use of the X-Analytics HTTP response header
 *
 * This header is used for analytics purposes.
 * @see https://www.mediawiki.org/wiki/Analytics/Kraken/Data_Formats/X-Analytics
 * @var bool
 */
$wgMFEnableXAnalyticsLogging = false;

/**
 * Sample rate to log events for section usage in mobile web
 *
 * @var number
 */
$wgMFSchemaMobileWebSectionUsageSampleRate = 0;


/**
 * Sample rate to log events for language button and overlay usage in mobile web
 *
 * @var array
 */
$wgMFSchemaMobileWebLanguageSwitcherSampleRate = array(
	'beta' => 0,
	'stable' => 0
);
