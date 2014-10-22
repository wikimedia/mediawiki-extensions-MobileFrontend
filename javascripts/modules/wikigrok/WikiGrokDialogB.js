( function( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var WikiGrokDialog = M.require( 'modules/wikigrok/WikiGrokDialog' ),
		WikiGrokDialogB;

	/**
	 * @class WikiGrokDialog
	 * @extends InlineDialog
	 * THIS IS AN EXPERIMENTAL FEATURE THAT MAY BE MOVED TO A SEPARATE EXTENSION.
	 * This creates the dialog at the bottom of the lead section that appears when a user
	 * scrolls past the lead. It asks the user to confirm metadata information for use
	 * in Wikidata (https://www.wikidata.org).
	 */
	WikiGrokDialogB = WikiGrokDialog.extend( {
		version: 'b',
		template: M.template.get( 'modules/wikigrok/WikiGrokDialogB.hogan' ),
		initialize: function( options ) {
			options.contentMsg = 'Which of these tags best describe ' + options.title + '?';
			WikiGrokDialog.prototype.initialize.apply( this, arguments );
		},
		/**
		 * Renders a set of checkbox buttons to the panel
		 * Shows panel to user when there are suggestions.
		 * @method
		 * @param {Array} suggestions as returned by WikiGrokApi.getSuggestions
		 */
		_renderSuggestions: function( suggestions ) {
			var
				self = this,
				allSuggestions = [], suggestionsList = [],
				// Maps item ids to a key in i18n file
				lookupProp = {},
				i18n = {
					dob: 'Born on:',
					dod: 'Died on:',
					nationality: 'Home country:',
					occupations: 'Profession:'
				};

			$.each( suggestions, function( type, data ) {
				var prop = {
						name: data.name,
						id: data.id
					};

				allSuggestions = allSuggestions.concat( data.list );
				// Make sure it's easy to look up the property later.
				$.each( data.list, function( i, itemId ) {
					lookupProp[itemId] = prop;
				} );
			} );

			// randomly pick 6 suggestions
			suggestionsList = self.chooseRandomItemsFromArray( allSuggestions, 6 );

			// Now work out the labels if we have some suggestions
			if ( suggestionsList.length ) {
				self.apiWikiData.getLabels( suggestionsList ).done( function( labels ) {
					$.each( labels, function( itemId, label ) {
						var btnLabel, $chk,
							prop = lookupProp[itemId],
							id = 'chk-' + itemId;

						$chk = $( '<div class="ui-checkbox-button mw-ui-button">' ).
							on( 'click', function() {
								var $chkBox = $( this ).find( 'input' );
								$chkBox.prop( 'checked', !$chkBox.prop( 'checked' ) );
								setTimeout( function() {
									self.$save.prop( 'disabled', self.$( '.initial-pane input:checked' ).length === 0 );
								}, 100 );
							} ).appendTo( self.$( '.wg-buttons' ) );

						// FIXME: Use a template for this magic.
						$( '<input type="checkbox">' ).
							attr( 'id', id ).
							data( 'propName', prop.name ).
							data( 'propId', prop.id ).
							data( 'itemId', itemId ).
							data( 'readable', label ).
							appendTo( $chk );

						$( '<label>' ).
							text( i18n[prop.name] ).appendTo( $chk );

						$( '<label>' ).
							text( label ).
							html( btnLabel ).appendTo( $chk );
					} );

					// only show the panel when we have created at least one checkbox button
					if ( self.$( '.ui-checkbox-button' ).length ) {
						self.$( '.spinner' ).hide();
						self.show();
					}
				} );
			}
		},
		postRender: function() {
			var self = this;
			this.$save = this.$( '.mw-ui-constructive' );
			// hide the completion screen
			self.$( '.final-pane' ).hide();

			this.hide();
			self.apiWikiData.getClaims().done( function( claims ) {
				if ( claims.isHuman ) {
					self.apiWikiGrok.getSuggestions().done( function( suggestions ) {
						self._renderSuggestions( suggestions );
					} );
				}
			} );
			this.$save.on( 'click', function() {
				var answers = [];
				self.$( '.ui-checkbox-button input:checked' ).hide().each( function() {
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
				self.apiWikiGrok.recordClaims( answers ).done( function() {
					self.$( '.spinner' ).hide();
					self.$( '.initial-pane' ).hide();
					self.$( '.final-pane' ).show();
				} );
			} );

			// hide this Dialog when the user reads more about Wikigrok
			this.$( '.tell-more' ).on( 'click', function() {
				self.hide();
			} );
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDialogB', WikiGrokDialogB );
}( mw.mobileFrontend, jQuery ) );
