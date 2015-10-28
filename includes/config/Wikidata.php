<?php
// Needs to be called within MediaWiki; not standalone
if ( !defined( 'MEDIAWIKI' ) ) {
	echo "This is a MediaWiki extension and cannot run standalone.\n";
	die( -1 );
}

/**
 * If set to true and running beta, will add Wikidata description to page JS as
 * wgMFDescription variable
 */
$wgMFUseWikibaseDescription = false;

/**
 * If set to true wikidata descriptions will be displayed in UI elements such as search,
 * nearby and watchlist.
 */
$wgMFDisplayWikibaseDescription = false;

/**
 * Define the property that holds a string representing a category on $wgMFPhotoUploadEndpoint
 */
$wgMFWikibaseImageCategory = '';
