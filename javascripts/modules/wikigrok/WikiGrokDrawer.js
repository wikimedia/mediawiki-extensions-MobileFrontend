( function( M, $ ) {
	M.assertMode( [ 'alpha' ] );

	var Drawer = M.require( 'Drawer' ),
		WikiGrokDrawer;

	/**
	 * @class WikiGrokDrawer
	 * @extends Drawer
	 * THIS IS AN EXPERIMENTAL FEATURE THAT MAY BE MOVED TO A SEPARATE EXTENSION.
	 * This creates the drawer at the bottom of the screen that appears when a user
	 * scrolls past the lead. It asks the user to confirm metadata information for use
	 * in Wikidata (https://www.wikidata.org).
	 */
	WikiGrokDrawer = Drawer.extend( {
		locked: true,
		defaults: {
			beginQuestions: false,
			thankUser: false,
			closeMsg: mw.msg( 'mobile-frontend-overlay-close' ),
			headerMsg: 'Help Wikipedia',
			contentMsg: 'Wikipedia needs your help with some information…',
			// Other ideas:
			// Can you help improve Wikipedia?
			// Play a game to help Wikipedia!
			// Help add tags to this page!
			buttons: [
				{ classes: 'cancel inline mw-ui-button', label: 'No, thanks' },
				{ classes: 'proceed inline mw-ui-button mw-ui-progressive', label: 'Okay!' }
			]
		},
		template: M.template.get( 'modules/wikigrok/WikiGrokDrawer.hogan' ),

		askWikidataQuestion: function( options ) {
			var self = this;

			// Get potential occupations for the person.
			// FIXME: Create a client-side API class for interacting with the WikiGrok API
			$.ajax( {
				type: 'get',
				// https://github.com/kaldari/WikiGrokAPI
				url: 'https://tools.wmflabs.org/wikigrok/api.php',
				data: {
					'action': 'get_potential_occupations',
					// Strip the Q out of the Wikibase item ID
					'item': options.itemId.replace( 'Q' , '' )
				},
				dataType: 'jsonp',
				success: function( data ) {
					var occupationArray;

					// If there are potential occupations for this person, select one at
					// random and ask if it is a correct occupation for the person.
					if ( data.occupations !== undefined ) {
						occupationArray = data.occupations.split( ',' );
						// Choose a random occupation from the list of possible occupations.
						options.occupationId = 'Q' + occupationArray[ Math.floor( Math.random() * occupationArray.length ) ];
						// Remove any disambiguation parentheticals from the title.
						options.name = mw.config.get( 'wgTitle' ).replace( / \(.+\)$/, '' );

						// Get the name of the occupation from Wikidata.
						$.ajax( {
							type: 'get',
							url: 'https://www.wikidata.org/w/api.php',
							data: {
								'action': 'wbgetentities',
								'props': 'labels',
								'ids': options.occupationId,
								'format': 'json'
							},
							dataType: 'jsonp',
							success: function( data ) {
								var vowels = [ 'a', 'e', 'i', 'o', 'u' ];
								if ( data.entities[options.occupationId].labels.en.value !== undefined ) {
									// Re-render with new content for 'Question' step
									options.beginQuestions = true;
									options.occupation = data.entities[options.occupationId].labels.en.value;
									// Hack for English prototype
									if ( $.inArray( options.occupation.charAt(0), vowels ) === -1 ) {
										options.contentMsg = 'Was ' + options.name + ' a ' + options.occupation + '?';
									} else {
										options.contentMsg = 'Was ' + options.name + ' an ' + options.occupation + '?';
									}
									options.buttons = [
										{ classes: 'yes inline mw-ui-button mw-ui-progressive', label: 'Yes' },
										{ classes: 'not-sure inline mw-ui-button', label: 'Not Sure' },
										{ classes: 'no inline mw-ui-button mw-ui-progressive', label: 'No' }
									];
									self.render( options );
								}
							}
						} );
					}
				}
			} );
		},

		// Record answer in temporary database for analysis.
		// Eventually answers will be recorded directly to Wikidata.
		recordClaim: function( options ) {
			var self = this;
			$.ajax( {
				type: 'get',
				url: 'https://tools.wmflabs.org/wikigrok/api.php',
				data: {
					'action': 'record_answer',
					'subject_id': options.itemId,
					'subject': options.name,
					'occupation_id': options.occupationId,
					'occupation': options.occupation,
					'page_name': mw.config.get( 'wgPageName' ),
					'correct': options.claimIsCorrect,
					'source': 'mobile A'
				},
				dataType: 'jsonp',
				success: function() {
					// Re-render with new content for 'Thanks' step
					options.thankUser = true;
					options.contentMsg = 'You just made Wikipedia a little better!';
					options.buttons = [
						{ classes: 'quit inline mw-ui-button mw-ui-progressive', label: 'Great!' }
					];
					self.render( options );
				}
			} );
		},

		postRender: function( options ) {
			var self = this;

			// If the user hasn't opted-out of WikiGrok, load the interface.
			if ( !localStorage.getItem( 'mfHideWikiGrok' ) ) {
				this._super.call( this, options );
				// For final 'Thanks' step
				if ( options.thankUser ) {
					this.$( '.wg-buttons .quit' ).on( 'click', function() {
						self.hide();
					} );
				// For intermediate 'Question' step
				} else if ( options.beginQuestions ) {
					this.$( '.wg-buttons .yes' ).on( 'click', function() {
						self.hide();
						options.claimIsCorrect = 1;
						self.recordClaim( options );
					} );
					this.$( '.wg-buttons .not-sure' ).on( 'click', function() {
						// Do nothing.
						self.hide();
					} );
					this.$( '.wg-buttons .no' ).on( 'click', function() {
						self.hide();
						options.claimIsCorrect = 0;
						self.recordClaim( options );
					} );
				// For initial 'Intro' step
				} else {
					this.$( '.wg-buttons .cancel' ).on( 'click', function() {
						// Hiding is already bound to all cancel buttons, so we don't have
						// bind it here.
						// Set a localStorage value to keep WikiGrok hidden for this user.
						// We test for locaStorage support in wikigrok.js.
						// Older browsers can only store strings in localStorage (not booleans).
						localStorage.setItem( 'mfHideWikiGrok', 'true' );
					} );
					this.$( '.wg-buttons .proceed' ).on( 'click', function() {
						self.hide();
						// Proceed with asking the user a metadata question.
						self.askWikidataQuestion( options );
					} );
				}
				// render() does a "deep copy" $.extend() on the template data, so we need
				// to reset the buttons after each step (since some steps have fewer
				// buttons than the initial default).
				self.options.buttons = [];
				this.show();
			}
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDrawer', WikiGrokDrawer );
}( mw.mobileFrontend, jQuery ) );
