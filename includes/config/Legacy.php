<?php
// Needs to be called within MediaWiki; not standalone
if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

/*
 * Allow editing (uploading) to external CentralAuth-enabled wikis where
 * the user might not be logged in.
 * FIXME: This should be determined by whether central auth is installed or not.
 */
$wgMFUseCentralAuthToken = false;

/**
 * If set to true, main page HTML will receive special massaging that removes everything
 * but a few select pieces.
 */
$wgMFSpecialCaseMainPage = true;

/**
 * Controls whether site notices should be shown.
 */
$wgMFEnableSiteNotice = false;

/**
 * Controls whether API action=mobileview should have every HTML section tidied for invalid markup
 */
$wgMFTidyMobileViewSections = true;

/**
 * Requests containing header with this name will be considered as coming from mobile devices.
 * The default value is for backwards compatibility.
 * Set to false to explicitly disable this way of detection.
 */
$wgMFMobileHeader = 'X-WAP';

/**
 * Make the classes, tags and ids stripped from page content configurable.
 * Each item will be stripped from the page.
 */
$wgMFRemovableClasses = array(
	// These rules will be used for all transformations
	'base' => array(),
	// HTML view
	'HTML' => array(),
);

/**
 * DB key of the category which members will never display mobile view
 */
$wgMFNoMobileCategory = false;

/**
 * Prefixed names of pages that will never display mobile view
 */
$wgMFNoMobilePages = array();
