const ReferencesGateway = require( './ReferencesGateway' ),
	mfExtend = require( './../mfExtend' ),
	util = require( './../util' );

/**
 * Gateway for retrieving references via the content of the Page
 *
 * @class ReferencesHtmlScraperGateway
 * @memberof module:mobile.startup/references
 * @extends module:mobile.startup/references~Gateway
 * @inheritdoc
 */
function ReferencesHtmlScraperGateway() {
	ReferencesGateway.apply( this, arguments );
}

mfExtend( ReferencesHtmlScraperGateway, ReferencesGateway, {
	/**
	 * @memberof ReferencesHtmlScraperGateway
	 * @property EXTERNAL_LINK_CLASS a CSS class to place on external links
	 * in addition to the default 'external' class.
	 */
	EXTERNAL_LINK_CLASS: 'external--reference',
	/**
	 * @memberof ReferencesHtmlScraperGateway
	 * @instance
	 * @param {string} id ID of a DOM element in the page.
	 * @param {jQuery.Object} $container to scan for an element
	 * @return {jQuery.Promise} that can be used by getReference
	 */
	getReferenceFromContainer( id, $container ) {
		const result = util.Deferred();

		const $el = $container.find( '#' + util.escapeSelector( id ) );
		if ( $el.length ) {
			let $parent;

			// This finds either the inner <ol class="mw-extended-references">, or the outer
			// <ol class="references">
			const $ol = $el.closest( 'ol' );
			if ( $ol.hasClass( 'mw-extended-references' ) ) {
				$parent = $ol.parent();
			}
			// The following classes are used here:
			// * external--reference
			// * other values of EXTERNAL_LINK_CLASS in sub-classes
			( $parent || $el ).find( '.external' ).addClass( this.EXTERNAL_LINK_CLASS );
			result.resolve( {
				text: this.getReferenceHtml( $el ),
				parentText: this.getReferenceHtml( $parent )
			} );
		} else {
			result.reject( ReferencesGateway.ERROR_NOT_EXIST );
		}
		return result.promise();
	},
	/**
	 * @memberof ReferencesHtmlScraperGateway
	 * @param {jQuery.Object|undefined} $reference
	 * @returns {string}
	 */
	getReferenceHtml( $reference ) {
		return $reference ?
			$reference.find( '.mw-reference-text, .reference-text' ).first().html() :
			'';
	},
	/**
	 * @inheritdoc
	 * @memberof ReferencesHtmlScraperGateway
	 * @instance
	 * @param {string} hash Hash fragment with leading '#'
	 * @param {Page} page (unused)
	 * @param {module:mobile.startup/PageHTMLParser} pageHTMLParser
	 */
	getReference( hash, page, pageHTMLParser ) {
		const id = mw.util.percentDecodeFragment( hash.slice( 1 ) );
		// If an id is not found it's possible the id passed needs decoding (per T188547).
		return this.getReferenceFromContainer( id, pageHTMLParser.$el.find( 'ol.references' ) );
	}
} );

module.exports = ReferencesHtmlScraperGateway;
