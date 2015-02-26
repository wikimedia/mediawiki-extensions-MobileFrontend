<?php
// Needs to be called within MediaWiki; not standalone
if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

/**
 * @var array A set of experiments.
 *
 * Consider the following example:
 *
 * <code>
 * $wgMFExperiments = array(
 *     'wikigrok' => array(
 *         'enabled' => true,
 *         'buckets' => array(
 *             'control' => 0.33,
 *             'A' => 0.33,
 *             'B' => 0.33,
 *         ),
 *     ),
 * );
 * </code>
 *
 * The wikigrok experiment has three buckets: control, A, and B. The user has a 33% chance of being
 * being assigned to each bucket. Note well that if the experiment were disabled, then the user is
 * always assigned to the control bucket.
 */
$wgMFExperiments = array();
