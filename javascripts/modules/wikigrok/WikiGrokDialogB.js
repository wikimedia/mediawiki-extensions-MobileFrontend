( function ( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

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
		 * @param {Array} suggestions as returned by WikiGrokApi.getSuggestions
		 */
		_renderSuggestions: function ( suggestions ) {
			var
				self = this,
				allSuggestions = [], suggestionsList = [],
				// Maps item ids to a key in i18n file
				lookupProp = {},
				i18n = {
					dob: 'Born on',
					dod: 'Died on',
					nationalities: 'Home country',
					occupations: 'Profession',
					schools: 'School'
				};

			$.each( suggestions, function ( type, data ) {
				var prop = {
						type: type,
						name: data.name,
						id: data.id
					};

				allSuggestions = allSuggestions.concat( data.list );
				// Make sure it's easy to look up the property later.
				$.each( data.list, function ( i, itemId ) {
					lookupProp[itemId] = prop;
				} );
			} );

			// randomly pick 4 suggestions
			suggestionsList = self.chooseRandomItemsFromArray( allSuggestions, 4 );

			// Now work out the labels if we have some suggestions
			if ( suggestionsList.length ) {
				self.apiWikiData.getLabels( suggestionsList ).done( function ( labels ) {
					self.$( '.wg-buttons' ).hide();
					self.$( '.tags' ).show();
					$.each( labels, function ( itemId, label ) {
						var btnLabel, $tag,
							prop = lookupProp[itemId],
							id = 'tag-' + itemId;

						$tag = $( '<div class="ui-tag-button mw-ui-button">' )
							.on( 'click', function () {
								$( this ).toggleClass( 'mw-ui-progressive' );
							} ).appendTo( self.$( '.tags' ) );

						// FIXME: Use a template for this magic.
						$tag.attr( 'id', id )
							.data( 'propName', prop.name )
							.data( 'propId', prop.id )
							.data( 'itemId', itemId )
							.data( 'readable', label );

						$( '<label>' )
							.text( i18n[prop.type] ).appendTo( $tag );

						$( '<label>' )
							.text( label )
							.html( btnLabel ).appendTo( $tag );
					} );

					// only show the panel when we have created at least one button
					if ( self.$( '.ui-tag-button' ).length ) {
						self.$( '.spinner' ).hide();
						self.show();
					}
				} ).fail(function () {
					self.logError( 'no-impression-cannot-fetch-labels' );
				} );
			}
		},
		/**
		 * Fetch suggestions from the server and show them to the user.
		 * Also record claims when the user hits the save button.
		 * @method
		 * @param {Object} options
		 */
		askWikidataQuestion: function ( options ) {
			var self = this;

			self.$( '.wg-notice' ).hide();
			self.$( '.wg-buttons' ).html( '<div class="spinner loading"></div>' );
			self.$( '.wg-content' ).text( 'Which of these tags best describe ' + options.title + '?' );
			self.$( '.footer' ).show();

			self._renderSuggestions( options.suggestions );

			this.$save = this.$( '.mw-ui-constructive' );
			this.$save.on( 'click', function () {
				var answers = [];
				self.$( '.wg-buttons .mw-ui-button' ).each( function () {
					var $this = $( this );
					answers.push( {
						correct: $this.is( '.mw-ui-progressive' ) ? true : null,
						prop: $this.data( 'propName' ),
						propid: $this.data( 'propId' ),
						value: $this.data( 'readable' ),
						valueid: $this.data( 'itemId' )
					} );
				} );

				self.$( '.spinner' ).show();
				self.apiWikiGrokResponse.recordClaims( answers ).done( function () {
					self.$( '.tags, .footer' ).hide();
					self.$( '.wg-content' ).text( 'You just made Wikipedia a little better, thanks!' );
					self.$( '.wg-link' ).show();
				} );
				self.log( 'widget-click-submit' );
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

		reveal: function ( options ) {
			var self = this;

			options.suggestions = {};
			self.apiWikiData.getClaims().done( function ( claims ) {
				if ( claims.isHuman ) {
					self.apiWikiGrokSuggestion.getSuggestions().done( function ( suggestions ) {
						if ( !$.isEmptyObject( suggestions ) ) {
							options.suggestions = suggestions;
							self.show();
						}
					} );
				}
			} );
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDialogB', WikiGrokDialogB );
}( mw.mobileFrontend, jQuery ) );
