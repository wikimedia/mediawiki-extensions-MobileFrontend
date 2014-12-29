<?php
if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

/**
 * Specify whether to show red links (page doesn't exist) for logged in users
 * using stable or beta mode. Red links are always shown in alpha mode.
 */
$wgMFShowRedLinks = false;

/**
 * Specify whether to show red links (page doesn't exist) for anonymous users
 * using stable or beta mode. Red links are always shown in alpha mode.
 */
$wgMFShowRedLinksAnon = false;

/**
 * Options to control several functions of the mobile editor.
 * Possible values:
 * - 'anonymousEditing':
 *	Whether or not anonymous (not logged in) users should be able to edit.
 *	Note this is highly experimental and comes without any warranty and may introduce bugs
 *	until anonymous editing experience is addressed in this extension. Anonymous editing
 *	on mobile is still a big unknown. See bug 53069.
 *	Thoughts welcomed on https://www.mediawiki.org/wiki/Mobile_wikitext_editing#Anonymous_editing
 * - 'skipPreview': Should the mobile edit workflow contain an edit preview (before save) to give
 *	the user the possibility to review the new text resulting of his changes or not.
 */
$wgMFEditorOptions = array(
	'anonymousEditing' => false,
	'skipPreview' => false,
);
