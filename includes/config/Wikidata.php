<?php
// Needs to be called within MediaWiki; not standalone
if ( !defined( 'MEDIAWIKI' ) ) {
	echo "This is a MediaWiki extension and cannot run standalone.\n";
	die( -1 );
}

/**
 * If set to true and running alpha, will add Wikidata description to page JS as
 * wgMFDescription variable
 */
$wgMFUseWikibaseDescription = false;

/**
 * Define the property that holds a string representing a category on $wgMFPhotoUploadEndpoint
 */
$wgMFWikibaseImageCategory = '';
