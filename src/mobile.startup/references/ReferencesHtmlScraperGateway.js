var ReferencesGateway = require( './ReferencesGateway' ),
	mfExtend = require( './../mfExtend' ),
	util = require( './../util' );

/**
 * Gateway for retrieving references via the content of the Page
 *
 * @class ReferencesHtmlScraperGateway
 * @extends ReferencesGateway
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
		var $el, $ol, $parent,
			result = util.Deferred();

		$el = $container.find( '#' + util.escapeSelector( id ) );
		if ( $el.length ) {
			// This finds either the inner <ol class="mw-extended-references">, or the outer
			// <ol class="references">
			$ol = $el.closest( 'ol' );
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
	 * @param {PageHTMLParser} pageHTMLParser
	 */
	getReference( hash, page, pageHTMLParser ) {
		var id = mw.util.percentDecodeFragment( hash.slice( 1 ) );
		// If an id is not found it's possible the id passed needs decoding (per T188547).
		return this.getReferenceFromContainer( id, pageHTMLParser.$el.find( 'ol.references' ) );
	}
} );

module.exports = ReferencesHtmlScraperGateway;
