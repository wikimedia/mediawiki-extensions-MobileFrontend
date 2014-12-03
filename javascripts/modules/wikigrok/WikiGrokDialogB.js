( function ( M, $ ) {
	var WikiGrokDialog = M.require( 'modules/wikigrok/WikiGrokDialog' ),
		WikiGrokDialogB;

	/**
	 * @class WikiGrokDialogB
	 * @extends WikiGrokDialog
	 * THIS IS AN EXPERIMENTAL FEATURE THAT MAY BE MOVED TO A SEPARATE EXTENSION.
	 * This creates the dialog at the bottom of the lead section that appears when a user
	 * scrolls past the lead. It asks the user to confirm metadata information for use
	 * in Wikidata (https://www.wikidata.org).
	 */
	WikiGrokDialogB = WikiGrokDialog.extend( {
		version: 'b',
		template: mw.template.get( 'mobile.wikigrok.dialog.b', 'Dialog.hogan' ),
		initialize: function () {
			var self = this;

			WikiGrokDialog.prototype.initialize.apply( this, arguments );

			// log page impression and widget impression when the widget is shown
			this.once( 'show', function () {
				self.logPageImpression();
				self.initializeWidgetImpressionLogging();

			} );
		},
		/**
		 * Renders a set of buttons to the panel
		 * Shows panel to user when there are suggestions.
		 * @method
		 */
		_renderSuggestions: function ( campaign ) {
			var suggestions,
				self = this,
				i18n = {
					actor: 'Profession',
					author: 'Profession',
					album: 'Album type'
				};

			// randomly pick 4 suggestions
			suggestions = self.chooseRandomItemsFromArray( campaign.suggestions, 4 );

			// Now work out the labels if we have some suggestions
			if ( suggestions.length ) {
				self.apiWikiData.getLabels( suggestions ).done( function ( labels ) {
					var $next = self.$( '.footer .next' ),
						$none = self.$( '.footer .none' );

					// Hard-code the "Next" button width to match the "None" button width.
					// That way, when the buttons are switched, the width stays the same.
					// This depends on the assumption that the "Next" button text is
					// always shorter than the "None" button text.
					$next.css( 'width', $none.outerWidth() );

					self.$( '.tags' ).show();
					$.each( labels, function ( itemId, label ) {
						var $tag,
							id = 'tag-' + itemId;

						if ( label ) {
							$tag = $( '<div class="ui-tag-button mw-ui-button">' )
								.on( 'click', function () {
									// Activate the tag
									$( this ).toggleClass( 'mw-ui-progressive' );
									// If there are any tags active, switch submit button from
									// "None" to "Next".
									if ( self.$( '.tags .ui-tag-button.mw-ui-progressive' ).length ) {
										$none.hide();
										$next.show();
									} else {
										$next.hide();
										$none.show();
									}
								} ).appendTo( self.$( '.tags' ) );

							// FIXME: Use a template for this magic.
							$tag.attr( 'id', id )
								.data( 'propName', campaign.name )
								.data( 'propId', campaign.property )
								.data( 'itemId', itemId )
								.data( 'readable', label );

							// Add the property label
							$( '<label>' )
								.text( i18n[campaign.name] ).appendTo( $tag );

							// Add the value label
							$( '<label>' )
								.text( label ).appendTo( $tag );
						}
					} );

					// only show the panel when we have created at least one button
					if ( self.$( '.ui-tag-button' ).length ) {
						self.$( '.spinner' ).hide();
						self.show();
					}
				} ).fail( function () {
					self.logError( 'no-impression-cannot-fetch-labels' );
				} );
			}
		},
		/**
		 * Fetch suggestions from the server and show them to the user.
		 * Also record claims when the user hits the save button.
		 * FIXME: Please refactor
		 * @method
		 * @param {Object} options needed to render
		 */
		askWikidataQuestion: function ( options ) {
			var self = this;

			self.$( '.wg-notice' ).hide();
			self.$( '.wg-buttons' ).hide();
			self.$( '.spinner' ).show();
			self.$( '.wg-content' ).text( 'Select tags that correctly describe ' + options.title );
			self.$( '.footer' ).show();

			self._renderSuggestions( options.campaign );

			this.$save = this.$( '.save' );
			this.$save.on( 'click', function () {
				var answers = [];
				self.$( '.tags .ui-tag-button' ).each( function () {
					var $this = $( this );
					answers.push( {
						correct: $this.is( '.mw-ui-progressive' ) ? true : null,
						prop: $this.data( 'propName' ),
						propid: $this.data( 'propId' ),
						value: $this.data( 'readable' ),
						valueid: $this.data( 'itemId' )
					} );
				} );

				self.$( '.tags' ).hide();
				self.$( '.spinner' ).show();
				self.apiWikiGrokResponse.recordClaims( answers ).always( function () {
					self.$( '.tags, .footer' ).hide();
					self.$( '.spinner' ).hide();
					self.$( '.wg-content' ).text( 'You just made Wikipedia a little better, thanks!' );
					self.$( '.wg-link' ).show();
					self.log( 'widget-impression-success' );
				} ).fail( function () {
					self.logError( 'no-response-cannot-record-user-input' );
				} );
				self.log( 'widget-click-submit' );
				self.rememberWikiGrokContribution();
			} );

			// hide this Dialog when the user reads more about Wikigrok
			this.$( '.tell-more' ).on( 'click', function () {
				self.hide();
				self.log( 'widget-click-moreinfo' );
			} );
		},
		/**
		 * @inheritdoc
		 */
		postRender: function ( options ) {
			var self = this;

			self.$( '.tags, .wg-link, .footer, .spinner' ).hide();

			// show the welcome screen once
			if ( !options.beginQuestions ) {
				options.beginQuestions = true;
				this.$( '.wg-buttons .cancel' ).on( 'click', function () {
					self.hide();
					self.log( 'widget-click-nothanks' );
				} );
				this.$( '.wg-buttons .proceed' ).on( 'click', function () {
					self.log( 'widget-click-accept' );
					// Proceed with asking the user a metadata question.
					self.askWikidataQuestion( options );
				} );
				// Log more info clicks
				this.$( '.wg-notice-link' ).on( 'click', function () {
					self.log( 'widget-click-moreinfo' );
				} );

				this.reveal( options );
			}
		},

		/**
		 * @inheritdoc
		 */
		reveal: function ( options ) {
			if ( options.campaign ) {
				this.show();
			}
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDialogB', WikiGrokDialogB );
}( mw.mobileFrontend, jQuery ) );
