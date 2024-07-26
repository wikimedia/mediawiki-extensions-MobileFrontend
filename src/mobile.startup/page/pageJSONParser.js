const Page = require( '../Page' );
const util = require( '../util' );

/**
 * Create a Page object from an API response.
 *
 * @memberof Page
 * @param {Object} resp as representing a page in the API
 * @return {Page}
 */
function parse( resp ) {
	let displayTitle;
	const thumb = resp.thumbnail,
		pageprops = resp.pageprops || {
			displaytitle: mw.html.escape( resp.title )
		},
		terms = resp.terms || resp.entityterms;

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

	return new Page(
		util.extend( resp, {
			id: resp.pageid,
			isMissing: !!resp.missing,
			url: mw.util.getUrl( resp.title ),
			displayTitle // this is HTML!
		} )
	);
}

module.exports = { parse };
