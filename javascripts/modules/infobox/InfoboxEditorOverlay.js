( function ( M, $ ) {
	var InfoboxEditorOverlay,
		pageTitle = mw.config.get( 'wgTitle' ),
		icons = M.require( 'icons' ),
		LoadingOverlay = M.require( 'LoadingOverlay' ),
		//WikiGrokApi = M.require( 'modules/wikigrok/WikiGrokApi' ),
		Overlay = M.require( 'Overlay' );
	/**
	 * A Wikidata generated infobox editor
	 * @class InfoboxEditorOverlay
	 * @extends Overlay
	 */
	InfoboxEditorOverlay = Overlay.extend( {
		/**
		 * @inheritdoc
		 */
		defaults: {
			title: pageTitle,
			descriptionLabel: mw.msg( 'mobile-frontend-wikidata-editor-description-label', pageTitle )
		},
		/**
		 * @inheritdoc
		 */
		templatePartials: {
			spinner: icons.spinner,
			saveMsg: mw.msg( 'mobile-frontend-editor-save' ),
			header: mw.template.get( 'mobile.infobox', 'EditorOverlayHeader.hogan' ),
			content: mw.template.get( 'mobile.infobox', 'EditorOverlayContent.hogan' )
		},
		/**
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			var self = this;
			this.infobox = options.infobox;
			Overlay.prototype.initialize.apply( this, arguments );
			this.infobox.emit( 'load' );
			// make sure the infobox has fully intialized.
			this.infobox.getDeferred().done( function () {
				self.render( self.infobox.options );
				self.$( '.spinner' ).remove();
				self.$( '.editor-interface' ).removeClass( 'hidden' );
			} );
		},
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			var loader,
				self = this;

			this.$( '.submit' ).on( 'click', function () {
				var val = self.$( '.description' ).val();
				$( this ).prop( 'disabled', true );
				// reuse api so we can make use of caching in future
				self.infobox.getApi().saveDescription( val ).done( function () {
					// clear the existing hash for the refresh
					loader = new LoadingOverlay();
					loader.show();
					window.location.hash = '';
					window.location.query = 'cachebust=' + Math.random();
					// Give time for wikidata to update...
					window.setTimeout( function () {
						window.location.reload();
					}, 300 );
				} );
			} );
			Overlay.prototype.postRender.apply( this, arguments );
		}
	} );

	M.define( 'modules/wikigrok/InfoboxEditorOverlay', InfoboxEditorOverlay );

}( mw.mobileFrontend, jQuery ) );
