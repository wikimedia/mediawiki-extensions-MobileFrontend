( function( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var Panel = M.require( 'Panel' ),
		WikiGrokApi = M.require( 'modules/wikigrok/WikiGrokApi' ),
		WikiDataApi = M.require( 'modules/wikigrok/WikiDataApi' ),
		schema = M.require( 'loggingSchemas/mobileWebWikiGrok' ),
		WikiGrokDialog;

	/**
	 * @class WikiGrokDialog
	 * @extends Panel
	 * THIS IS AN EXPERIMENTAL FEATURE THAT MAY BE MOVED TO A SEPARATE EXTENSION.
	 * This creates the dialog at the bottom of the lead section that appears when a user
	 * scrolls past the lead. It asks the user to confirm metadata information for use
	 * in Wikidata (https://www.wikidata.org).
	 */
	WikiGrokDialog = Panel.extend( {
		version: 'a',
		className: 'wikigrok',
		defaults: {
			beginQuestions: false,
			thankUser: false,
			closeMsg: mw.msg( 'mobile-frontend-overlay-close' ),
			headerMsg: 'Help Wikipedia',
			contentMsg: 'Improve Wikipedia by tagging information on this page',
			// Other ideas:
			// Can you help improve Wikipedia?
			// Play a game to help Wikipedia!
			// Help add tags to this page!
			buttons: [
				{ classes: 'cancel inline mw-ui-button', label: 'No, thanks' },
				{ classes: 'proceed inline mw-ui-button mw-ui-progressive', label: 'Okay!' }
			],
			noticeMsg: '<a class="wg-notice-link" href="#/wikigrok/about">Tell me more</a>'
		},
		template: M.template.get( 'modules/wikigrok/WikiGrokDialog.hogan' ),

		initialize: function( options ) {
			// Remove any disambiguation parentheticals from the title.
			options.name = options.title.replace( / \(.+\)$/, '' );
			this.apiWikiGrok = new WikiGrokApi( { itemId: options.itemId, subject: options.name } );
			this.apiWikiData = new WikiDataApi( { itemId: options.itemId } );
			Panel.prototype.initialize.apply( this, arguments );
		},

		log: function( action ) {
			var data = {
				action: action,
				version: 'version ' + this.version
			};
			schema.log( data );
		},

		chooseRandomItemFromArray: function( array ) {
			return array[ Math.floor( Math.random() * array.length ) ];
		},

		askWikidataQuestion: function( options ) {
			var self = this,
				occupationArray = options.occupations;

			// If there are potential occupations for this person, select one at
			// random and ask if it is a correct occupation for the person.
			if ( occupationArray.length ) {
				// Choose a random occupation from the list of possible occupations.
				options.occupationId = this.chooseRandomItemFromArray( occupationArray );

				// Get the name of the occupation from Wikidata.
				self.apiWikiData.getLabel( options.occupationId ).done( function( label ) {
					var vowels = [ 'a', 'e', 'i', 'o', 'u' ];
					if ( label ) {
						// Re-render with new content for 'Question' step
						options.beginQuestions = true;
						options.occupation = label;
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
						options.noticeMsg = 'All submissions are <a class="wg-notice-link" href="#/wikigrok/about">released freely</a>';
						self.render( options );
					}
					options.buttons = [
						{ classes: 'yes inline mw-ui-button mw-ui-progressive', label: 'Yes' },
						{ classes: 'not-sure inline mw-ui-button', label: 'Not Sure' },
						{ classes: 'no inline mw-ui-button mw-ui-progressive', label: 'No' }
					];
					options.noticeMsg = 'All submissions are <a class="wg-notice-link" href="#/wikigrok/about">released freely</a>';
					self.render( options );
				} );
			}
		},

		// Record answer in temporary database for analysis.
		// Eventually answers will be recorded directly to Wikidata.
		recordClaim: function( options ) {
			var self = this,
				args = [ options.occupationId,
					options.occupation, options.claimIsCorrect ];

			this.apiWikiGrok.recordOccupation.apply( this.apiWikiGrok, args ).done( function() {
				self.thankUser( options, true );
			} );
		},

		thankUser: function( options, claimRecorded ) {
			options.thankUser = true;
			if ( claimRecorded ) {
				options.contentMsg = 'You just made Wikipedia a little better, thanks!';
				options.buttons = [
					{ classes: 'quit inline mw-ui-button mw-ui-progressive', label: 'Great!' }
				];
			} else {
				options.contentMsg = "That's OK, thanks for taking the time.";
				options.buttons = [
					{ classes: 'quit inline mw-ui-button mw-ui-progressive', label: 'Done' }
				];
			}
			options.noticeMsg = '<a class="wg-notice-link" href="#/wikigrok/about">Tell me more</a>';
			// Re-render with new content for 'Thanks' step
			this.render( options );
		},

		postRender: function( options ) {
			var self = this;

			// If you're wondering where the DOM insertion happens, look in wikigrokeval.js.

			// Initialize all the buttons and links
			// ...for final 'Thanks' step
			if ( options.thankUser ) {
				this.$( '.wg-buttons .quit' ).on( 'click', function() {
					self.hide();
				} );
			// ...for intermediate 'Question' step
			} else if ( options.beginQuestions ) {
				this.$( '.wg-buttons .yes' ).on( 'click', function() {
					self.log( 'success' );
					options.claimIsCorrect = 1;
					self.recordClaim( options );
				} );
				this.$( '.wg-buttons .not-sure' ).on( 'click', function() {
					self.log( 'notsure' );
					self.thankUser( options, false );
				} );
				this.$( '.wg-buttons .no' ).on( 'click', function() {
					self.log( 'success' );
					options.claimIsCorrect = 0;
					self.recordClaim( options );
				} );
			// ...for initial 'Intro' step
			} else {
				this.log( 'view' );
				this.$( '.wg-buttons .cancel' ).on( 'click', function() {
					self.hide();
					self.log( 'nothanks' );
					M.settings.saveUserSetting( 'mfHideWikiGrok', 'true' );
				} );
				this.$( '.wg-buttons .proceed' ).on( 'click', function() {
					self.log( 'attempt' );
					// Proceed with asking the user a metadata question.
					self.askWikidataQuestion( options );
				} );
				// Log more info clicks
				this.$( '.wg-notice-link' ).on( 'click', function() {
					self.log( 'moreinfo' );
				} );
			}

			// render() does a "deep copy" $.extend() on the template data, so we need
			// to reset the buttons after each step (since some steps have fewer
			// buttons than the initial default).
			self.options.buttons = [];

			this.show();
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDialog', WikiGrokDialog );
}( mw.mobileFrontend, jQuery ) );
