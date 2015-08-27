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

// FIXME: Where's the link describing the Browse experiment that I can reference
// when I'm talking about the Browse experiment?
/**
 * Whether or not the Browse experiment is enabled.
 *
 * @var boolean
 */
$wgMFIsBrowseEnabled = false;

/**
 * A static map of category name to tag name.
 *
 * Read this map as follows: if an article is categorised as X, then it is
 * tagged as Y.
 *
 * @var string[]
 */
$wgMFBrowseTags = array(
	// 'Category:English_post-rock_groups' => 'Objectively awesome music',
);

/**
 * Disable login page override in all modes.
 * FIXME: This config is highly experimental and temporary only. Use it on your own risk!
 */
$wgMFNoLoginOverride = false;

/**
 * This is a list of html tags, that could be recognized as the first heading of a page.
 * This is an interim solution to fix Bug T110436 and shouldn't be used, if you don't know,
 * what you do. Moreover, this configuration variable will be removed in the near future
 * (hopefully).
 */
$wgMFMobileFormatterHeadings = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' );
