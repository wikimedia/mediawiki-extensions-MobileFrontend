( function ( M, $ ) {
	var ReferencesHtmlScraperGateway = M.require(
			'mobile.references.gateway/ReferencesHtmlScraperGateway' ),
		Page = M.require( 'mobile.startup/Page' );

	/**
	 * Gateway for retrieving references via the MobileView API
	 *
	 * @class ReferencesMobileViewGateway
	 * @extends ReferencesHtmlScraperGateway
	 * @inheritdoc
	 */
	function ReferencesMobileViewGateway() {
		ReferencesHtmlScraperGateway.apply( this, arguments );
	}

	OO.mfExtend( ReferencesMobileViewGateway, ReferencesHtmlScraperGateway, {
		/**
		 * Retrieve references for a given page
		 *
		 * @method
		 * @param {Page} page
		 * @return {jQuery.Promise} passed an instance of the jQuery.object
		 *  representing all the sections in the page
		 */
		getReferencesElements: function ( page ) {
			var self = this;

			if ( this.$references ) {
				return $.Deferred().resolve( self.$references ).promise();
			} else if ( this.pendingMobileViewApi ) {
				// avoid ever making more than one api request
				return this.pendingMobileViewApi;
			}

			this.pendingMobileViewApi = this.api.get( {
				action: 'mobileview',
				page: page.getTitle(),
				sections: 'references',
				prop: 'text',
				revision: page.getRevisionId()
			} ).then( function ( data ) {
				var sections = data.mobileview.sections,
					refs = [];

				if ( sections ) {
					// There could be multiple <references> tags in the page.
					$.each( sections, function ( i, section ) {
						// skip the section header, just get the references
						refs.push( $( '<div>' ).html( section.text ).find( '.references' ).eq( 0 ) );
					} );
				}

				// cache
				self.$references = $( refs );

				return self.$references;
			} );
			return this.pendingMobileViewApi;
		},
		/**
		 * @inheritdoc
		 */
		getReference: function ( id, page ) {
			var self = this,
				parentGetReference = ReferencesHtmlScraperGateway.prototype.getReference;

			return this.getReferencesElements( page ).then( function ( $refSections ) {
				// append to a new page to avoid side effects on the passed Page object.
				var refPage = new Page( page.options );

				$refSections.each( function () {
					// With each replace the matched element is removed from the list.
					// That's why we always replace the first matched element.
					refPage.$( '.mf-lazy-references-placeholder' ).eq( 0 ).replaceWith( this );
				} );
				return parentGetReference.call( self, id, refPage );
			} );
		}
	} );

	M.define( 'mobile.references.gateway/ReferencesMobileViewGateway',
		ReferencesMobileViewGateway );
}( mw.mobileFrontend, jQuery ) );
