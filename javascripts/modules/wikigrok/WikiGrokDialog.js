 ( function ( M, $ ) {
	var Panel = M.require( 'Panel' ),
		settings = M.require( 'settings' ),
		WikiGrokResponseApi = M.require( 'modules/wikigrok/WikiGrokResponseApi' ),
		WikiDataApi = M.require( 'modules/wikigrok/WikiDataApi' ),
		wikiGrokCampaigns = M.require( 'modules/wikigrok/wikiGrokCampaigns' ),
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
			contentMsg: 'Improve Wikipedia by tagging information on this page',
			// Other ideas:
			// Can you help improve Wikipedia?
			// Play a game to help Wikipedia!
			// Help add tags to this page!
			buttons: [
				{
					classes: 'cancel inline mw-ui-button',
					label: 'No, thanks'
				},
				{
					classes: 'proceed inline mw-ui-button mw-ui-progressive',
					label: 'Okay!'
				}
			],
			noticeMsg: '<a class="wg-notice-link" href="#/wikigrok/about">Tell me more</a>'
		},
		template: mw.template.get( 'mobile.wikigrok.dialog', 'Dialog.hogan' ),

		initialize: function ( options ) {
			var self = this;

			options.campaign = wikiGrokCampaigns.getRandomCampaign();
			// Remove any disambiguation parentheticals from the title.
			options.name = options.title.replace( / \(.+\)$/, '' );

			this.apiWikiGrokResponse = new WikiGrokResponseApi( {
				itemId: options.itemId,
				subject: options.name,
				version: this.version,
				userToken: options.userToken,
				taskToken: this.defaults.taskToken
			} );
			this.apiWikiData = new WikiDataApi( {
				itemId: options.itemId
			} );
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
		 * @param {string} action to log as described in schema
		 *  See [Schema][1] for details on valid values.
		 *
		 * [1]: https://meta.wikimedia.org/wiki/Schema:MobileWebWikiGrok}
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
		 * @param {string} error to log as described in schema
		 *  See [Schema][1] for details on valid values.
		 *
		 * [1]: https://meta.wikimedia.org/wiki/Schema:MobileWebWikiGrok}
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
			var arrayCopy, i, randomIndex,
				result = [],
				arrayLength = array.length;

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

		/**
		 * Creates a question with a yes, no and not sure answer.
		 * Makes API request to Wikidata to retrieve labels and uses campaigns for that.
		 * FIXME: No i18n
		 * @method
		 * @param {Object} options needed to render.
		 */
		askWikidataQuestion: function ( options ) {
			var self = this,
				vowels = [ 'a', 'e', 'i', 'o', 'u' ];

			options.claimId = options.campaign.randomClaimId;

			self.apiWikiData.getLabels( [ options.claimId ] ).done( function ( labels ) {
				options.claimLabel = labels[ options.claimId ];
				if ( options.claimLabel ) {
					if ( options.campaign.name === 'author' ) {
						// Hack for English prototype
						if ( $.inArray( options.claimLabel.charAt( 0 ), vowels ) === -1 ) {
							options.contentMsg = 'Is ' + options.name + ' a ' + options.claimLabel + '?';
						} else {
							options.contentMsg = 'Is ' + options.name + ' an ' + options.claimLabel + '?';
						}
					} else if ( options.campaign.name === 'actor' ) {
						options.contentMsg = 'Is ' + options.name + ' a ' + options.claimLabel + '?';
					} else if ( options.campaign.name === 'album' ) {
						options.contentMsg = 'Is this a ' + options.claimLabel + '?';
					}

					// Re-render with new content for 'Question' step
					options.beginQuestions = true;
					options.buttons = [
						{
							classes: 'yes inline mw-ui-button mw-ui-progressive',
							label: 'Yes'
						},
						{
							classes: 'not-sure inline mw-ui-button',
							label: 'Not Sure'
						},
						{
							classes: 'no inline mw-ui-button mw-ui-progressive',
							label: 'No'
						}
					];
					options.noticeMsg = 'All submissions are <a class="wg-notice-link" ' +
						'href="#/wikigrok/about">released freely</a>';
					self.render( options );
				} else {
					self.showError( options, 'There was an error retrieving tag labels.' );
				}
			} ).fail( function () {
				self.logError( 'no-impression-cannot-fetch-labels' );
			} );
		},

		showError: function ( options, errorMsg ) {
			options.contentMsg = errorMsg;
			options.buttons = [
				{
					classes: 'cancel inline mw-ui-button mw-ui-progressive',
					label: 'OK'
				}
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
					propid: options.campaign.property
				};

			if (
				options.campaign.name === 'author' ||
				options.campaign.name === 'actor'
			) {
				claim.prop = 'occupation';
			} else if ( options.campaign.name === 'album' ) {
				claim.prop = 'instance of';
			}

			this.apiWikiGrokResponse.recordClaims( [ claim ] ).always( function () {
				self.thankUser( options, true );
			} ).fail( function () {
				self.logError( 'no-response-cannot-record-user-input' );
			} );
		},

		/**
		 * Save the page title in localStorage so that we don't show WikiGrok on this page
		 * the next time the user sees the page.
		 */
		rememberWikiGrokContribution: function () {
			var pages = $.parseJSON(
					settings.get( 'pagesWithWikiGrokContributions', false ) || '{}'
				);

			pages[M.getCurrentPage().title] = true;
			settings.save( 'pagesWithWikiGrokContributions', JSON.stringify( pages ), false );
		},

		thankUser: function ( options, claimAttempted ) {
			this.rememberWikiGrokContribution();
			options.thankUser = true;
			if ( claimAttempted ) {
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
					options.claimIsCorrect = true;
					self.recordClaim( options );
				} );
				this.$( '.wg-buttons .not-sure' ).on( 'click', function () {
					self.log( 'widget-click-submit' );
					self.thankUser( options, false );
				} );
				this.$( '.wg-buttons .no' ).on( 'click', function () {
					self.log( 'widget-click-submit' );
					options.claimIsCorrect = false;
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

		/**
		 * Show WikiGrok dialog
		 * @param {Object} options
		 */
		reveal: function ( options ) {
			if ( options.campaign ) {
				this.show();
			}
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDialog', WikiGrokDialog );
}( mw.mobileFrontend, jQuery ) );
