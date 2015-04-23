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
