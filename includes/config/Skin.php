<?php
if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

/**
 * The default skin for MobileFrontend
 * Defaults to SkinMinerva
 */
$wgMFDefaultSkinClass = 'SkinMinerva';

/**
 * Make the logos configurable.
 *
 * Currently, 'copyright', 'copyright-width', and 'copyright-height' elements are supported.
 * 'copyright' is the URL of the logo for your content license.
 * 'copyright-width' (optional) is the width in pixels of the copyright image you want to display
 * 'copyright-height' (optional) is the height in pixels of the copyright image you want to display
 * If the actual 'copyright' dimensions are 200x30, then you may want to set the width and height
 * to 100 and 15 respectively (in order to support retina screens).
 *
 * Example: array(
 *	'copyright' => '/images/mysite_copyright_logo.png',
 *	'copyright-width' => 100,
 *	'copyright-height' => 15,
 *	);
 */
$wgMFCustomLogos = array();

/**
 * Path to the logo used in the login/signup form
 * The standard height is 72px
 * FIXME: Merge with $wgMFCustomLogos
 */
$wgMobileFrontendLogo = false;

/**
 * Controls, which page action show and which not. Allowed:
 * edit, talk, upload, watch
 */
$wgMFPageActions = array( 'edit', 'talk', 'upload', 'watch' );

/**
 * In which namespaces sections shoudn't be collapsed
 */
$wgMFNamespacesWithoutCollapsibleSections = array(
	// Authorship and licensing information should be visible initially
	NS_FILE,
	// Otherwise category contents will be hidden
	NS_CATEGORY,
	// Don't collapse various forms
	NS_SPECIAL,
	// Just don't
	NS_MEDIA,
);

/**
 * Controls whether to collapse sections by default.
 *
 * Leave at default true for "encyclopedia style", where the section 0 lead text will
 * always be visible and subsequent sections may be collapsed by default.
 *
 * Set to false for "dictionary style", sections are not collapsed.
 */
$wgMFCollapseSectionsByDefault = true;
