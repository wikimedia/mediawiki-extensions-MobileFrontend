<?php
// Needs to be called within MediaWiki; not standalone
if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

/**
 * Disable EventLogging bucketing for purposes of development.
 * When enabled all events are logged regardless of any existing sampling rate specified in
 * the schema.
 *
 * @var boolean
 */
$wgMFIgnoreEventLoggingBucketing = false;

/**
 * A list of experiments active on the skin.
 *
 * @var array
 */
$wgMFExperiments = array(
	// Experiment to prompts users to opt into the beta experience of the skin.
	'betaoptin' => array(
		'name' => 'betaoptin',
		'enabled' => false,
		'buckets' => array(
			'control' => 0.97,
			'A' => 0.03,
		),
	),
	// A/B test that measures the impact of section collapsing by default
	'sectionCollapsing' => array(
		'name' => 'sectionCollapsing',
		'enabled' => false,
		'buckets' => array(
			'control' => 0.5,
			'A' => 0.5,
		),
	),
);

/**
 * Controls whether the "Minerva as a desktop skin" beta feature is enabled
 */
$wgMFEnableMinervaBetaFeature = false;

/**
 * Controls whether a message should be logged to the console to attempt to recruit volunteers.
 */
$wgMFEnableJSConsoleRecruitment = false;

/**
 * This is a list of html tags, that could be recognized as the first heading of a page.
 * This is an interim solution to fix Bug T110436 and shouldn't be used, if you don't know,
 * what you do. Moreover, this configuration variable will be removed in the near future
 * (hopefully).
 */
$wgMFMobileFormatterHeadings = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' );

