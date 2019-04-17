const Page = require( '../Page' );
const time = require( '../time' );
const util = require( '../util' );

/**
 * Create a Page object from an API response.
 *
 * @memberof Page
 * @param {Object} resp as representing a page in the API
 * @return {Page}
 */
function parse( resp ) {
	var revision, displayTitle,
		thumb = resp.thumbnail,
		pageprops = resp.pageprops || {
			displaytitle: mw.html.escape( resp.title )
		},
		terms = resp.terms;

	if ( pageprops || terms ) {
		// The label is either the display title or the label pageprop
		// (the latter used by Wikidata)
		// Long term we want to consolidate these.
		// Note that pageprops.displaytitle is HTML, while
		// terms.label[0] is plain text.
		displayTitle = terms && terms.label ?
			mw.html.escape( terms.label[0] ) : pageprops.displaytitle;
	}
	// Add Wikidata descriptions if available (T101719)
	resp.wikidataDescription = resp.description || undefined;

	if ( thumb ) {
		resp.thumbnail.isLandscape = thumb.width > thumb.height;
	}

	// page may or may not exist.
	if ( resp.revisions && resp.revisions[0] ) {
		revision = resp.revisions[0];
		resp.lastModified = time.getLastModifiedMessage(
			new Date( revision.timestamp ).getTime() / 1000,
			revision.user
		);
	}

	return new Page(
		util.extend( resp, {
			id: resp.pageid,
			isMissing: !!resp.missing,
			url: mw.util.getUrl( resp.title ),
			displayTitle: displayTitle // this is HTML!
		} )
	);
}

module.exports = { parse };
