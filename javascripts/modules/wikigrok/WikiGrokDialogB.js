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
		template: M.template.get( 'modules/wikigrok/WikiGrokDialogB.hogan' ),
		initialize: function ( options ) {
			var self = this;

			options.contentMsg = 'Which of these tags best describe ' + options.title + '?';
			WikiGrokDialog.prototype.initialize.apply( this, arguments );

			// log page impression and widget impression when the widget is shown
			this.once( 'show', function () {
				self.logPageImpression();
				self.initializeWidgetImpressionLogging();

			} );
		},
		/**
		 * Renders a set of checkbox buttons to the panel
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
					occupations: 'Profession'
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

			// randomly pick 6 suggestions
			suggestionsList = self.chooseRandomItemsFromArray( allSuggestions, 6 );

			// Now work out the labels if we have some suggestions
			if ( suggestionsList.length ) {
				self.apiWikiData.getLabels( suggestionsList ).done( function ( labels ) {
					$.each( labels, function ( itemId, label ) {
						var btnLabel, $tag,
							prop = lookupProp[itemId],
							id = 'tag-' + itemId;

						$tag = $( '<div class="ui-tag-button mw-ui-button">' ).
							on( 'click', function () {
								$( this ).toggleClass( 'mw-ui-progressive' );
								// Update save button
								setTimeout( function () {
									self.$save.prop( 'disabled', self.$( '.initial-pane .mw-ui-progressive' ).length === 0 );
								}, 100 );
							} ).appendTo( self.$( '.wg-buttons' ) );

						// FIXME: Use a template for this magic.
						$tag.attr( 'id', id ).
							data( 'propName', prop.name ).
							data( 'propId', prop.id ).
							data( 'itemId', itemId ).
							data( 'readable', label );

						$( '<label>' ).
							text( i18n[prop.type] ).appendTo( $tag );

						$( '<label>' ).
							text( label ).
							html( btnLabel ).appendTo( $tag );

						// Limit to 4 results by breaking out of .each
						if ( self.$( '.initial-pane .ui-tag-button' ).length === 4 ) {
							return false;
						}
					} );

					// only show the panel when we have created at least one button
					if ( self.$( '.ui-tag-button' ).length ) {
						self.$( '.spinner' ).hide();
						self.show();
					}
				} );
			}
		},
		postRender: function () {
			var self = this;
			this.$save = this.$( '.mw-ui-constructive' );
			// hide the completion screen
			self.$( '.final-pane' ).hide();

			this.hide();
			self.apiWikiData.getClaims().done( function ( claims ) {
				if ( claims.isHuman ) {
					self.apiWikiGrok.getSuggestions().done( function ( suggestions ) {
						self._renderSuggestions( suggestions );
					} );
				}
			} );
			this.$save.on( 'click', function () {
				var answers = [];
				self.$( '.initial-pane .mw-ui-progressive' ).hide().each( function () {
					answers.push( {
						correct: true,
						prop: $( this ).data( 'propName' ),
						propid: $( this ).data( 'propId' ),
						value: $( this ).data( 'readable' ),
						valueid: $( this ).data( 'itemId' )
					} );
				} );
				$( this ).hide();
				self.$( '.spinner' ).show();
				self.apiWikiGrok.recordClaims( answers ).done( function () {
					self.$( '.spinner' ).hide();
					self.$( '.initial-pane' ).hide();
					self.$( '.final-pane' ).show();
					self.log( 'widget-click-submit' );
				} );
			} );

			// hide this Dialog when the user reads more about Wikigrok
			this.$( '.tell-more' ).on( 'click', function () {
				self.hide();
			} );
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDialogB', WikiGrokDialogB );
}( mw.mobileFrontend, jQuery ) );
