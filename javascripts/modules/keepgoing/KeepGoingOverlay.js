( function( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var Overlay = M.require( 'Overlay' ),
		mobileWebCta = M.require( 'loggingSchemas/mobileWebCta' ),
		KeepGoingOverlay;

	/**
	 * @class KeepGoingOverlay
	 * @extends Overlay
	 * This creates the overlay at the bottom of the screen that appears after a user
	 * successfully completes their first edit. It encourages the user to edit another page.
	 */
	KeepGoingOverlay = Overlay.extend( {
		defaults: {
			// Step key: 1 = asking, 2 = explaining
			step: 1,
			continueButton: true,
			heading: mw.msg( 'mobilefrontend-keepgoing-saved-title' ),
			cancel: mw.msg( 'mobilefrontend-keepgoing-cancel' ),
			contentClass: 'content vertical-margin',
			campaign: 'mobile-keepgoing',
			fixedHeader: false,
			headerButtonsListClassName: 'overlay-action',
			headerButtons: [
				{ className: 'continue', msg: mw.msg( 'mobile-frontend-overlay-continue' ) }
			]
		},
		className: 'overlay overlay-bottom position-fixed',
		closeOnContentTap: true,
		fullScreen: false,
		templatePartials: {
			content: M.template.get( 'keepgoing/KeepGoingOverlay' )
		},

		log: function( status ) {
			mobileWebCta.log( status, this.options.campaign, this.options.step );
		},
		initialize: function( options ) {
			var exampleMsg;
			options = $.extend( {}, this.defaults, options );
			if ( !options.msg ) {
				if ( options.isNewEditor ) {
					options.msg = mw.msg( 'mobilefrontend-keepgoing-links-ask-first' );
				} else if ( options.step === 1 ) {
					options.msg = mw.msg( 'mobilefrontend-keepgoing-links-ask-again' );
				} else if ( options.step === 2 ) {
					options.msg = mw.msg( 'mobilefrontend-keepgoing-links-explain' );
					options.heading = mw.msg( 'mobilefrontend-keepgoing-links-title' );
					// Escape i18n input here, since we will be outputting unescaped HTML
					// in the template.
					exampleMsg = mw.message( 'mobilefrontend-keepgoing-links-example' ).escaped();
					// Manually substitute in HTML formatting
					options.example = exampleMsg
						.replace( '$1', '<span class="wikitext">[[' )
						.replace( '$2', ']]</span>' )
						.replace( '$3', '<span class="fake-link">' )
						.replace( '$4', '</span>' );
					options.continueButton = false;
				}
			}
			this._super( options );
		},
		render: function( options ) {
			var self = this,
				_super = self._super,
				url;
			options = options || {};
			if ( options.msg ) {
				// FIXME: If this is moved to stable, the category should become configurable
				url = mw.util.getUrl( 'Special:RandomInCategory/All articles with too few wikilinks', { campaign: options.campaign } );

				_super.call( self, options );
				mobileWebCta.hijackLink( self.$( '.continue' ), 'keepgoing-success', options.campaign, options.step, url );
				self.$( '.close' ).on( 'click', function() {
					self.log( 'keepgoing-exit' );
				} );
				this.log( 'keepgoing-shown' );
			}
		}
	} );

	M.define( 'modules/keepgoing/KeepGoingOverlay', KeepGoingOverlay );
}( mw.mobileFrontend, jQuery ) );
