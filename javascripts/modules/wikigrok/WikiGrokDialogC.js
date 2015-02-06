( function ( M, $ ) {
	var WikiGrokDialogB = M.require( 'modules/wikigrok/WikiGrokDialogB' ),
		wikiGrokRoulette = M.require( 'modules/wikiGrokRoulette/wikiGrokRoulette' ),
		Drawer = M.require( 'Drawer' ),
		browser = M.require( 'browser' ),
		icons = M.require( 'icons' ),
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
		events: {
			'click .wg-badge .next': 'onClickNext'
		},
		/**
		 * Load the next page if available.
		 * Show badge when the user reaches a milestone.
		 * @inheritdoc
		 * @method
		 */
		postRecordClaims: function ( options ) {
			var self = this,
				badgeLevels = [ 1, 3, 5, 10, 20, 50, 100 ],
				showNext = true,
				responseCount;

			self.$( '.spinner' ).show();

			// Count responses if local storage supported
			if ( browser.supportsLocalStorage ) {
				responseCount = parseInt( localStorage.getItem( 'wikiGrokResponseCount' ) );
				// Increment claim response count
				if ( !isNaN( responseCount ) ) {
					responseCount++;
				} else {
					responseCount = 1;
				}
				// Save response count
				localStorage.setItem( 'wikiGrokResponseCount', responseCount );

				// Add badge if responseCount is at a badge level
				if ( $.inArray( responseCount, badgeLevels ) !== -1 ) {
					showNext = false;
					if ( responseCount === 1 ) {
						options.tasks = responseCount + ' task';
					} else {
						options.tasks = responseCount + ' tasks';
					}
					options.responseCount = responseCount;
					if ( responseCount < 25 ) {
						options.encouragementText = 'Good going!';
					} else if ( responseCount < 100 ) {
						options.encouragementText = 'Whooa, hold up!';
					} else {
						options.encouragementText = 'Nice!';
					}
					options.spinner = icons.spinner( {
						tagName: 'span'
					} ).toHtmlString();
					this.template = mw.template.get( 'mobile.wikigrok.dialog.c', 'Badge.hogan' );
					this.render( options );
				}
			}
			if ( showNext ) {
				wikiGrokRoulette.navigateToNextPage();
			}
		},

		/**
		 * Load the next WikiGrok page
		 */
		onClickNext: function () {
			this.$el.find( '.next ' ).prop( 'disabled', true )
				.find( '.text' ).hide()
				.end()
				.find( '.spinner' ).css( 'visibility', 'visible' );
			wikiGrokRoulette.navigateToNextPage( true );
		},

		/**
		 * @inheritdoc
		 */
		postRender: function ( options ) {
			var self = this;

			Drawer.prototype.postRender.apply( this, arguments );

			// Don't run this when rendering the Badge template
			if ( !options.beginQuestions ) {
				options.beginQuestions = true;
				WikiGrokDialogB.prototype.postRender.apply( this, arguments );

				self.askWikidataQuestion( options );

				// Silently fetch the next page
				wikiGrokRoulette.getNextPage();
			}
			this.show();
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDialogC', WikiGrokDialogC );
}( mw.mobileFrontend, jQuery ) );
