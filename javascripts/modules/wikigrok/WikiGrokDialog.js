( function ( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var Panel = M.require( 'Panel' ),
		WikiGrokApi = M.require( 'modules/wikigrok/WikiGrokApi' ),
		WikiDataApi = M.require( 'modules/wikigrok/WikiDataApi' ),
		schema = M.require( 'loggingSchemas/mobileWebWikiGrok' ),
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
		template: M.template.get( 'modules/wikigrok/WikiGrokDialog.hogan' ),

		initialize: function ( options ) {
			var self = this;

			// Remove any disambiguation parentheticals from the title.
			options.name = options.title.replace( / \(.+\)$/, '' );
			this.apiWikiGrok = new WikiGrokApi( { itemId: options.itemId, subject: options.name,
				version: this.version } );
			this.apiWikiData = new WikiDataApi( { itemId: options.itemId } );
			Panel.prototype.initialize.apply( this, arguments );

			// log page impression and widget impression when the widget is shown
			this.on( 'show', function () {
				self.logPageImpression();
				self.initializeWidgetImpressionLogging();

			} );
		},

		log: function ( action ) {
			var data = {
				action: action,
				taskType: 'version ' + this.version,
				taskToken: this.defaults.taskToken,
				// the position of the top of the widget in viewports (as a unit)
				widgetOffset: ( this.$el.offset().top / $window.height() ).toFixed( 2 ),
				// top of the document - top of the viewport in viewports (as a unit)
				scrollOffset: ( $window.scrollTop() / $window.height() ).toFixed( 2 )
			};
			schema.log( data );
		},
		/**
		 * Return a new array from 'array' with 'count' randomly selected elements.
		 * @param array - Array from which random elements are selected
		 * @param count - Positive number of random elements to select
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
				occupationArray = options.occupations;

			// If there are potential occupations for this person, select one at
			// random and ask if it is a correct occupation for the person.
			if ( occupationArray.length ) {
				// Choose a random occupation from the list of possible occupations.
				options.occupationId = this.chooseRandomItemsFromArray( occupationArray, 1 )[0];

				// Get the name of the occupation from Wikidata.
				self.apiWikiData.getLabels( [ options.occupationId ] ).done( function ( labels ) {
					var vowels = [ 'a', 'e', 'i', 'o', 'u' ],
						label = labels[options.occupationId];

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
					} else {
						self.showError( options, 'There was an error retrieving tag labels.' );
					}
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
				args = [ options.occupationId,
					options.occupation, options.claimIsCorrect ];

			this.apiWikiGrok.recordOccupation.apply( this.apiWikiGrok, args ).done( function () {
				self.thankUser( options, true );
			} );
		},

		thankUser: function ( options, claimRecorded ) {
			options.thankUser = true;
			if ( claimRecorded ) {
				options.contentMsg = 'You just made Wikipedia a little better, thanks!';
				options.buttons = [
					{ classes: 'quit inline mw-ui-button mw-ui-progressive', label: 'Great!' }
				];
			} else {
				options.contentMsg = 'That\'s OK, thanks for taking the time.';
				options.buttons = [
					{ classes: 'quit inline mw-ui-button mw-ui-progressive', label: 'Done' }
				];
			}
			options.noticeMsg = '<a class="wg-notice-link" href="#/wikigrok/about">Tell me more</a>';
			// Re-render with new content for 'Thanks' step
			this.render( options );
			this.log( 'widget-impression-success' );
		},

		/**
		 * Check if at least half of the element's height and half of its width are in viewport
		 * @method
		 * @param $el {jQuery.Object}
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

		postRender: function ( options ) {
			var self = this;

			// If you're wondering where the DOM insertion happens, look in wikigrokeval.js.

			// Initialize all the buttons and links
			// ...for final 'Thanks' step
			if ( options.thankUser ) {
				this.$( '.wg-buttons .quit' ).on( 'click', function () {
					self.hide();
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
					M.settings.saveUserSetting( 'mfHideWikiGrok', 'true' );
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
			this.apiWikiGrok.getPossibleOccupations().done( function ( occupations ) {
				if ( occupations.length ) {
					options.occupations = occupations;
					self.show();
				}
			} );
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDialog', WikiGrokDialog );
}( mw.mobileFrontend, jQuery ) );
