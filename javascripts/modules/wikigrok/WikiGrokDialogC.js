( function ( M, $ ) {
	var WikiGrokDialogB = M.require( 'modules/wikigrok/WikiGrokDialogB' ),
		Drawer = M.require( 'Drawer' ),
		browser = M.require( 'browser' ),
		WikiGrokDialogC;

	/**
	 * WikiGrok that's fixed at the bottom of the page.
	 * @class WikiGrokDialogC
	 * @extends WikiGrokDialogB
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
		 * Show badge when the user reaches a milestone.
		 * @inheritdoc
		 * @method
		 */
		postRecordClaims: function () {
			var self = this,
				wikiGrokMenuItem = $( '#mw-mf-page-left' ).find( '.wikigrok-roulette' ),
				badgeLevels = [ 1, 3, 5, 10, 20, 50, 100 ],
				showNext = true,
				responseText,
				responseCount;

			self.$( '.wg-content, .wg-thanks-content, .wg-link, .footer' ).hide();
			self.$( '.spinner' ).show();

			if ( wikiGrokMenuItem.length ) {
				// Count responses if local storage supported
				if ( browser.supportsLocalStorage ) {
					responseCount = localStorage.getItem( 'wikiGrokResponseCount' );
					// Increment claim response count, null if no responses
					if ( responseCount !== null ) {
						responseCount++;
					} else {
						responseCount = 1;
					}
					// Save response count
					localStorage.setItem( 'wikiGrokResponseCount', responseCount );

					// Add badge if responseCount is at a badge level
					if ( $.inArray( responseCount, badgeLevels ) !== -1 ) {
						showNext = false;
						responseText = 'Good going! <br> You just completed ' + responseCount + ' task';
						if ( responseCount === 1 ) {
							responseText += '.';
						} else {
							responseText += 's.';
						}
						self.$( '.spinner' ).hide();
						self.$( '.wg-link' ).empty().addClass( 'wg-badge-' + responseCount ).show();
						self.$( '.wg-content' )
							.html( responseText )
							.show();
						// let the user enjoy the badge for 2 seconds
						setTimeout( function () {
							wikiGrokMenuItem.trigger( 'click' );
						}, 2000 );
					}
				}
				if ( showNext ) {
					wikiGrokMenuItem.trigger( 'click' );
				}
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
