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
		postRender: function() {
			var self = this;
			this.$save = this.$( '.mw-ui-constructive' );
			WikiGrokDialog.prototype.postRender.apply( this, arguments );
			// hide the completion screen
			self.$( '.final-pane' ).hide();

			this.hide();
			this.apiWikiGrok.getPossibleOccupations().done( function( suggestionList ) {
				if ( suggestionList.length ) {
					self.apiWikiData.getClaims().done( function( claims ) {
						var suggestions = {
								hasOccupation: suggestionList
							},
							questions = {
								hasOccupation: 'Profession:'
							};

						$.each( claims, function( key ) {
							if ( suggestions[key] !== undefined ) {
								self.apiWikiData.getLabels( suggestions[key] ).done( function( labels ) {
									$.each( labels, function( itemId, label ) {
										var btnLabel, $chk,
											id = 'chk-' + key + '-' + itemId;

										$chk = $( '<div class="ui-checkbox-button mw-ui-button">' ).
											on( 'click', function() {
												var $chkBox = $( this ).find( 'input' );
												$chkBox.prop( 'checked', !$chkBox.prop( 'checked' ) );
												setTimeout( function() {
													self.$save.prop( 'disabled', self.$( '.initial-pane input:checked' ).length === 0 );
												}, 100 );
											} ).appendTo( self.$( '.wg-buttons' ) );

										$( '<input type="checkbox">' ).
											attr( 'id', id ).
											data( 'itemId', itemId ).
											data( 'readable', label ).
											appendTo( $chk );

										$( '<label>' ).
											text( questions[key] ).appendTo( $chk );

										$( '<label>' ).
											text( label ).
											html( btnLabel ).appendTo( $chk );
									} );

									self.$( '.spinner' ).hide();
									self.show();
								} );
							}
						} );
					} );
				}
			} );

			this.$save.on( 'click', function() {
				var answers = [];
				self.$( '.ui-checkbox-button input:checked' ).hide().each( function() {
					answers.push( {
						correct: true,
						prop: 'occupation',
						propid: 'P106',
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
