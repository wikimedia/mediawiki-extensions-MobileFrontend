<?php
if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

/**
 * The wiki id/dbname for where photos are uploaded, if photos are uploaded to
 * a wiki other than the local wiki (eg commonswiki).
 * @var string
 */
$wgMFPhotoUploadWiki = null;

/**
 * An api to which any photos should be uploaded
 * e.g. $wgMFPhotoUploadEndpoint = 'https://commons.wikimedia.org/w/api.php';
 * Defaults to the current wiki
 */
$wgMFPhotoUploadEndpoint = '';

/**
 * Set the minimum edits the user needs before they can upload images in mobile mode
 */
$wgMFUploadMinEdits = 0;
