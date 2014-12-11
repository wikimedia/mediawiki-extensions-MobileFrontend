( function ( M, $ ) {
	var WikiGrokDialogB = M.require( 'modules/wikigrok/WikiGrokDialogB' ),
		Drawer = M.require( 'Drawer' ),
		WikiGrokDialogC;

	/**
	 * WikiGrok that's fixed at the bottom of the page.
	 * @class WikiGrokDialogC
	 * @extends WikiGrokDialogB
	 * @extends Drawer
	 */
	WikiGrokDialogC = WikiGrokDialogB.extend( {
		appendToElement: Drawer.prototype.appendToElement,
		className: WikiGrokDialogB.prototype.className + ' ' + Drawer.prototype.className,
		version: 'c',
		defaults: $.extend( WikiGrokDialogB.prototype.defaults, {
			thanksMsg: 'You just made Wikipedia a little better, thanks! But wait, there is more.',
			isDrawer: true
		} ),
		/**
		 * Load the next page if available.
		 * @inheritdoc
		 * @method
		 */
		postRecordClaims: function () {
			var self = this,
				wikiGrokMenuItem = $( '#mw-mf-page-left' ).find( '.wikigrok-roulette' );

			if ( wikiGrokMenuItem.length ) {
				self.$( '.wg-content, .wg-thanks-content, .wg-link, .footer' ).hide();
				self.$( '.spinner' ).show();
				wikiGrokMenuItem.trigger( 'click' );
			} else {
				WikiGrokDialogB.prototype.postRecordClaims.apply( this, arguments );
			}
		},

		/**
		 * @inheritdoc
		 */
		postRender: function ( options ) {
			var self = this;

			Drawer.prototype.postRender.apply( this, arguments );

			options.beginQuestions = true;
			WikiGrokDialogB.prototype.postRender.apply( this, arguments );

			self.askWikidataQuestion( options );
			this.show();
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDialogC', WikiGrokDialogC );
}( mw.mobileFrontend, jQuery ) );
