<?php
// Needs to be called within MediaWiki; not standalone
if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

/**
 * Controls whether the "Minerva as a desktop skin" beta feature is enabled
 */
$wgMFEnableMinervaBetaFeature = false;

/**
 * Controls whether a message should be logged to the console to attempt to recruit volunteers.
 */
$wgMFEnableJSConsoleRecruitment = false;

/**
 * Whether or not the banner experiment is enabled.
 * https://www.mediawiki.org/wiki/Reading/Features/Article_lead_image
 *
 * @var boolean
 */
$wgMFIsBannerEnabled = true;

/**
 * This is a list of html tags, that could be recognized as the first heading of a page.
 * This is an interim solution to fix Bug T110436 and shouldn't be used, if you don't know,
 * what you do. Moreover, this configuration variable will be removed in the near future
 * (hopefully).
 */
$wgMFMobileFormatterHeadings = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' );

