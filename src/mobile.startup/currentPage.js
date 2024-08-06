/* global $ */
const
	Page = require( './Page' );

let page;

/**
 * Constructs an incomplete Page model singleton representing the currently loaded page.
 *
 * Because this depends on the presence of certain DOM elements, it
 * should only be called after the DOMContentLoaded event.
 *
 * @ignore
 * @return {Page}
 */
function loadCurrentPage() {
	if ( page ) {
		return page;
	}

	const permissions = [].concat( mw.config.get( 'wgRestrictionEdit', [] ) ),
		relevantTitle = mw.Title.newFromText( mw.config.get( 'wgRelevantPageName' ) ),
		title = mw.Title.newFromText( mw.config.get( 'wgPageName' ) );

	if ( permissions.length === 0 ) {
		permissions.push( '*' );
	}

	page = new Page( {
		title: title.getPrefixedText(),
		titleObj: title,
		relevantTitle: relevantTitle.getPrefixedText(),
		protection: {
			edit: permissions
		},
		revId: mw.config.get( 'wgRevisionId' ),
		isMainPage: mw.config.get( 'wgIsMainPage' ),
		isWatched: $( '#ca-watch' ).hasClass( 'watched' ),
		isMissing: mw.config.get( 'wgArticleId' ) === 0,
		id: mw.config.get( 'wgArticleId' ),
		namespaceNumber: mw.config.get( 'wgNamespaceNumber' )
	} );

	return page;
}

module.exports = loadCurrentPage;
