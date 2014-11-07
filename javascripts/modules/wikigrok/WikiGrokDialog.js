( function ( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var Panel = M.require( 'Panel' ),
		WikiGrokSuggestionApi = M.require( 'modules/wikigrok/WikiGrokSuggestionApi' ),
		WikiGrokResponseApi = M.require( 'modules/wikigrok/WikiGrokResponseApi' ),
		WikiDataApi = M.require( 'modules/wikigrok/WikiDataApi' ),
		schema = M.require( 'loggingSchemas/mobileWebWikiGrok' ),
		errorSchema = M.require( 'loggingSchemas/mobileWebWikiGrokError' ),
		WikiGrokDialog,
		timer = null,
		$window = $( window );

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
			taskToken: mw.user.generateRandomSessionId(),
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
		template: mw.template.get( 'mobile.wikigrok.dialog', 'Dialog.hogan' ),

		initialize: function ( options ) {
			var self = this;

			// Remove any disambiguation parentheticals from the title.
			options.name = options.title.replace( / \(.+\)$/, '' );
			this.apiWikiGrokSuggestion = new WikiGrokSuggestionApi( {
				itemId: options.itemId,
				subject: options.name,
				version: this.version
			} );
			this.apiWikiGrokResponse = new WikiGrokResponseApi( {
				itemId: options.itemId,
				subject: options.name,
				version: this.version,
				userToken: options.userToken,
				taskToken: this.defaults.taskToken
			} );
			this.apiWikiData = new WikiDataApi( { itemId: options.itemId } );
			Panel.prototype.initialize.apply( this, arguments );

			// log page impression and widget impression when the widget is shown
			this.once( 'show', function () {
				self.logPageImpression();
				self.initializeWidgetImpressionLogging();

			} );
		},

		/**
		 * Log data to the schema
		 * @method
		 * @param {string} action
		 */
		log: function ( action ) {
			var data = {
				action: action,
				taskType: 'version ' + this.version,
				taskToken: this.defaults.taskToken,
				userToken: this.options.userToken,
				// the position of the top of the widget in viewports (as a unit)
				widgetOffset: parseFloat( ( this.$el.offset().top / $window.height() ).toFixed( 2 ) ),
				// top of the document - top of the viewport in viewports (as a unit)
				scrollOffset: parseFloat( ( $window.scrollTop() / $window.height() ).toFixed( 2 ) )
			};
			if ( this.options.testing ) {
				data.testing = true;
			}
			schema.log( data );
		},

		/**
		 * Log data to the error schema
		 * @method
		 * @param {string} error
		 */
		logError: function ( error ) {
			var data = {
				error: error,
				taskType: 'version ' + this.version,
				taskToken: this.defaults.taskToken,
				userToken: this.options.userToken,
				isLoggedIn: !mw.user.isAnon()
			};
			if ( this.options.testing ) {
				data.testing = true;
			}
			errorSchema.log( data );
		},

		/**
		 * Return a new array from 'array' with 'count' randomly selected elements.
		 * @param {Array} array Array from which random elements are selected
		 * @param {number} count - Positive number of random elements to select
		 * @returns {Array}
		 */
		chooseRandomItemsFromArray: function ( array, count ) {
			var result = [], arrayCopy, arrayLength = array.length,
				i, randomIndex;

			if ( arrayLength >= 1 ) {
				count = ( count > arrayLength ) ? arrayLength : count;

				// only clone the array if we need to return more than one element
				if ( count > 1 ) {
					arrayCopy = array.slice();
					// with each iteration the arrayCopy size decreases by 1.
					for ( i = 1; i <= count; i++ ) {
						randomIndex = Math.round( Math.random() * ( arrayLength - i ) );
						result = result.concat( arrayCopy.splice( randomIndex, 1 ) );
					}
				} else {
					randomIndex = Math.round( Math.random() * ( arrayLength - 1 ) );
					result.push( array[ randomIndex ] );
				}
			}
			return result;
		},

		askWikidataQuestion: function ( options ) {
			var self = this,
				vowels = [ 'a', 'e', 'i', 'o', 'u' ],
				theCountries = [ 'United States', 'United Kingdom', 'Philippines',
					'Marshall Islands', 'Central African Republic' ];

			if ( options.suggestions.length ) {
				// choose a suggestion category (dob, dod, occupation, or nationality) randomly
				options.suggestion = this.chooseRandomItemsFromArray( options.suggestions, 1 )[0];
				// pick a claim randomly
				options.claimId = this.chooseRandomItemsFromArray( options.suggestion.list, 1 )[0];

				// Get the name of the claim from Wikidata.
				self.apiWikiData.getLabels( [ options.claimId ] ).done( function ( labels ) {
					options.claimLabel = labels[ options.claimId ];
					if ( options.claimLabel ) {
						// ask if it is a correct occupation for the person.
						// FIXME: add support for DOB and DOD
						if ( options.suggestion.name === 'occupations' ) {
							// Hack for English prototype
							if ( $.inArray( options.claimLabel.charAt( 0 ), vowels ) === -1 ) {
								options.contentMsg = 'Was ' + options.name + ' a ' + options.claimLabel + '?';
							} else {
								options.contentMsg = 'Was ' + options.name + ' an ' + options.claimLabel + '?';
							}
						} else if ( options.suggestion.name === 'nationality' ) {
							if ( $.inArray( options.claimLabel, theCountries ) === -1 ) {
								options.contentMsg = 'Was ' + options.name + ' a citizen of ' + options.claimLabel + '?';
							} else {
								options.contentMsg = 'Was ' + options.name + ' a citizen of the ' + options.claimLabel + '?';
							}
						}

						// Re-render with new content for 'Question' step
						options.beginQuestions = true;
						options.buttons = [
							{ classes: 'yes inline mw-ui-button mw-ui-progressive', label: 'Yes' },
							{ classes: 'not-sure inline mw-ui-button', label: 'Not Sure' },
							{ classes: 'no inline mw-ui-button mw-ui-progressive', label: 'No' }
						];
						options.noticeMsg = 'All submissions are <a class="wg-notice-link" href="#/wikigrok/about">released freely</a>';
						self.render( options );
					} else {
						self.showError( options, 'There was an error retrieving tag labels.' );
					}
				} ).fail( function () {
					self.logError( 'no-impression-cannot-fetch-labels' );
				} );
			}
		},

		showError: function ( options, errorMsg ) {
			options.contentMsg = errorMsg;
			options.buttons = [
				{ classes: 'cancel inline mw-ui-button mw-ui-progressive', label: 'OK' }
			];
			this.render( options );
		},

		// Record answer in temporary database for analysis.
		// Eventually answers will be recorded directly to Wikidata.
		recordClaim: function ( options ) {
			var self = this,
				claim = {
					valueid: options.claimId,
					value: options.claimLabel,
					correct: options.claimIsCorrect,
					propid: options.suggestion.id
				};

			// FIXME: add support for DOB and DOD
			if ( options.suggestion.name === 'occupations' ) {
				claim.prop = 'occupation';
			} else if ( options.suggestion.name === 'nationality' ) {
				claim.prop = 'nationality';
			}

			this.apiWikiGrokResponse.recordClaims( [ claim ] ).done( function () {
				options.claimRecorded = true;
				self.thankUser( options, options.claimRecorded );
			} ).fail( function () {
				self.logError( 'no-response-cannot-record-user-input' );
			} );
		},

		thankUser: function ( options, claimRecorded ) {
			options.thankUser = true;
			if ( claimRecorded ) {
				options.contentMsg = 'You just made Wikipedia a little better, thanks!';
			} else {
				options.contentMsg = 'That\'s OK, thanks for taking the time.';
			}
			// Re-render with new content for 'Thanks' step
			this.render( options );
			this.$( '.wg-notice' ).hide();
			this.log( 'widget-impression-success' );
		},

		/**
		 * Check if at least half of the element's height and half of its width are in viewport
		 * @method
		 * @param {jQuery.Object} $el - element that's being tested
		 * @return {boolean}
		 */
		isElementInViewport: function ( $el ) {
			var windowHeight = $window.height(),
				windowWidth = $window.width(),
				windowScrollLeft = $window.scrollLeft(),
				windowScrollTop = $window.scrollTop(),
				elHeight = $el.height(),
				elWidth = $el.width(),
				elOffset = $el.offset();
			return (
				( elHeight > 0 && elWidth > 0 ) &&
				( windowScrollTop + windowHeight >= elOffset.top + elHeight / 2 ) &&
				( windowScrollLeft + windowWidth >= elOffset.left + elWidth / 2 ) &&
				( windowScrollTop <= elOffset.top + elHeight / 2 )
			);
		},
		/**
		 * Log widget-impression if the widget is in viewport.
		 * Stop listening to events that are namespaced with the taskToken.
		 * @param {jQuery.Object} $el WikiGrokDialog element
		 */
		logWidgetImpression: function ( $el ) {
			// detect whether the dialog is in viewport, and
			// record it if yes
			if ( !this.isWidgetImpressionLogged ) {
				if ( this.isElementInViewport( $el ) ) {
					this.isWidgetImpressionLogged = true;
					$window.off( '.' + this.defaults.taskToken );
					this.log( 'widget-impression' );
				}
			}
		},

		/**
		 * Create namespaced window.resize and window.scroll events.
		 * The namespace is a unique taskToken. Log widget-impression once and
		 * stop listening to events that are namespaced with the taskToken.
		 * This method is intended to be run only once because we don't want
		 * to create and listen to the same events more than once.
		 * @method
		 */
		initializeWidgetImpressionLogging: function () {
			var self = this;
			if ( !this.isLogWidgetImpressionInitialized && !this.isWidgetImpressionLogged ) {
				// widget specific event listener because there may be more than
				// one widget on the page
				// FIXME: listen to page zoom/pinch too?
				$window.on(
					'resize.' + self.defaults.taskToken +
					' scroll.' + self.defaults.taskToken,
					// debounce
					function () {
						clearTimeout( timer );
						timer = setTimeout( function () {
							self.logWidgetImpression( self.$el );
						}, 250 );
					}
				);
				this.isLogWidgetImpressionInitialized = true;
			}
			// widget may be in the viewport already
			this.logWidgetImpression( self.$el );
		},

		/**
		 * Log page-impression once
		 * @method
		 */
		logPageImpression: function () {
			// record page impression
			if ( !this.isPageImpressionLogged ) {
				this.isPageImpressionLogged = true;
				this.log( 'page-impression' );
			}
		},
		/**
		 * @inheritdoc
		 */
		postRender: function ( options ) {
			var self = this;

			self.$( '.wg-link' ).hide();

			// If you're wondering where the DOM insertion happens, look in wikigrokeval.js.

			// Initialize all the buttons and links
			// ...for final 'Thanks' step
			if ( options.thankUser ) {
				self.$( '.wg-buttons' ).hide();
				self.$( '.wg-link' ).show();
				this.$( '.wg-link .tell-more' ).on( 'click', function () {
					self.hide();
					self.log( 'widget-click-moreinfo' );
				} );
			// ...for intermediate 'Question' step
			} else if ( options.beginQuestions ) {
				this.$( '.wg-buttons .yes' ).on( 'click', function () {
					self.log( 'widget-click-submit' );
					options.claimIsCorrect = 1;
					self.recordClaim( options );
				} );
				this.$( '.wg-buttons .not-sure' ).on( 'click', function () {
					self.log( 'widget-click-submit' );
					self.thankUser( options, false );
				} );
				this.$( '.wg-buttons .no' ).on( 'click', function () {
					self.log( 'widget-click-submit' );
					options.claimIsCorrect = 0;
					self.recordClaim( options );
				} );
			// ...for initial 'Intro' step
			} else {
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
			}

			// render() does a "deep copy" $.extend() on the template data, so we need
			// to reset the buttons after each step (since some steps have fewer
			// buttons than the initial default).
			self.options.buttons = [];

			this.reveal( options );
		},

		reveal: function ( options ) {
			var self = this;

			// fetch suggestions only if we didn't try loading suggestions before
			if ( options.suggestions ) {
				self.show();
			} else {
				options.suggestions = [];
				self.apiWikiData.getClaims().done( function ( claims ) {
					if ( claims.isHuman ) {
						self.apiWikiGrokSuggestion.getSuggestions().fail( function () {
							self.logError( 'no-impression-cannot-fetch-suggestions' );
						} ).done( function ( suggestions ) {
							// FIXME: add support for DOB and DOD
							if ( suggestions.occupations && suggestions.occupations.list.length ) {
								options.suggestions.push( suggestions.occupations );
							}
							if ( suggestions.nationalities && suggestions.nationalities.list.length ) {
								options.suggestions.push( suggestions.nationalities );
							}
							if ( options.suggestions.length ) {
								self.show();
							} else {
								// FIXME: remove this before deploying to stable
								self.logError( 'no-impression-not-enough-suggestions' );
							}
						} );
					}
				} );
			}
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDialog', WikiGrokDialog );
}( mw.mobileFrontend, jQuery ) );
