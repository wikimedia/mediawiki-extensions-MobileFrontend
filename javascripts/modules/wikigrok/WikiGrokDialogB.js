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

						$.each( claims, function( key, claim ) {
							var btnLabel, choice, $chk,
								id = 'chk-' + key;
							if ( !claim && suggestions[key] !== undefined ) {
								choice = self.chooseRandomItemFromArray( suggestions[key] );
								self.apiWikiData.getLabel( choice ).done( function( label ) {
									// oohhh let's find a claim and some suggestions
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
										data( 'choice', choice ).
										data( 'readable', label ).
										appendTo( $chk );

									$( '<label>' ).
										text( questions[key] ).appendTo( $chk );

									$( '<label>' ).
										text( label ).
										html( btnLabel ).appendTo( $chk );


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
				self.$( '.mw-ui-checkbox input[checked]' ).hide().each( function() {
					answers.push( [
						$( this ).data( 'choice' ),
						$( this ).data( 'readable' ),
						true
					] );
				} );
				$( this ).hide();
				self.$( '.spinner' ).show();
				// FIXME: This only saves the answer to the occupation question. We'll need to rethink this api
				// as soon as there are multiple choices.
				self.apiWikiGrok.recordOccupation.apply( self.apiWikiGrok, answers[0] ).done( function() {
					self.$( '.spinner' ).hide();
					self.$( '.initial-pane' ).hide();
					self.$( '.final-pane' ).show();
				} );
			} );

			// FIXME: This shoud be shared with WikiGrokDialog.js
			this.$( '.cancel' ).on( 'click', function() {
				self.hide();
				self.log( 'nothanks' );
				M.settings.saveUserSetting( 'mfHideWikiGrok', 'true' );
			} );
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDialogB', WikiGrokDialogB );
}( mw.mobileFrontend, jQuery ) );
