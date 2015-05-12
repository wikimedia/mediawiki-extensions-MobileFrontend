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
