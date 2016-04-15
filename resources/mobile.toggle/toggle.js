( function ( M, $ ) {
	var context = M.require( 'mobile.context/context' ),
		settings = M.require( 'mobile.settings/settings' ),
		browser = M.require( 'mobile.browser/browser' ),
		escapeHash = M.require( 'mobile.startup/util' ).escapeHash,
		arrowOptions = {
			name: 'arrow',
			additionalClassNames: 'indicator'
		},
		Icon = M.require( 'mobile.startup/Icon' );

	/**
	 * A class for enabling toggling
	 *
	 * @class
	 * @extends OO.EventEmitter
	 */
	function Toggler() {
		OO.EventEmitter.call( this );
		this._enable.apply( this, arguments );
	}
	OO.mixinClass( Toggler, OO.EventEmitter );

	/**
	 * Using the settings module looks at what sections were previously expanded on
	 * existing page.
	 *
	 * @method
	 * @param {Page} page
	 * @returns {Object} representing open sections
	 * @ignore
	 */
	function getExpandedSections( page ) {
		var expandedSections = $.parseJSON(
			settings.get( 'expandedSections', false ) || '{}'
		);
		expandedSections[page.title] = expandedSections[page.title] || {};
		return expandedSections;
	}

	/**
	 * @ignore
	 * @param {Object} expandedSections
	 * Save expandedSections to localStorage
	 */
	function saveExpandedSections( expandedSections ) {
		settings.save(
			'expandedSections', JSON.stringify( expandedSections ), false
		);
	}

	/**
	 * Given an expanded heading, store it to localStorage.
	 * If the heading is collapsed, remove it from localStorage.
	 *
	 * @param {jQuery.Object} $heading - A heading belonging to a section
	 * @param {Page} page
	 * @ignore
	 */
	function storeSectionToggleState( $heading, page ) {
		var headline = $heading.find( 'span' ).attr( 'id' ),
			isSectionOpen = $heading.hasClass( 'open-block' ),
			expandedSections = getExpandedSections( page );

		if ( headline ) {
			if ( isSectionOpen ) {
				expandedSections[page.title][headline] = ( new Date() ).getTime();
			} else {
				delete expandedSections[page.title][headline];
			}

			saveExpandedSections( expandedSections );
		}
	}

	/**
	 * Expand sections that were previously expanded before leaving this page.
	 * @param {Toggler} toggler
	 * @param {jQuery.Object} $container
	 * @param {Page} page
	 * @ignore
	 */
	function expandStoredSections( toggler, $container, page ) {
		var $sectionHeading, $headline,
			expandedSections = getExpandedSections( page ),
			$headlines = $container.find( '.section-heading span' );

		$headlines.each( function () {
			$headline = $( this );
			$sectionHeading = $headline.parents( '.section-heading' );
			// toggle only if the section is not already expanded
			if (
				expandedSections[page.title][$headline.attr( 'id' )] &&
				!$sectionHeading.hasClass( 'open-block' )
			) {
				toggler.toggle.call( toggler, $sectionHeading, page );
			}
		} );
	}

	/**
	 * Clean obsolete (saved more than a day ago) expanded sections from
	 * localStorage.
	 * @param {Page} page
	 * @ignore
	 */
	function cleanObsoleteStoredSections( page ) {
		var now = ( new Date() ).getTime(),
			expandedSections = getExpandedSections( page ),
			// the number of days between now and the time a setting was saved
			daysDifference;
		$.each( expandedSections, function ( page, sections ) {
			// clean the setting if it is more than a day old
			$.each( sections, function ( section, timestamp ) {
				daysDifference = Math.floor( ( now - timestamp ) / 1000 / 60 / 60 / 24 );
				if ( daysDifference >= 1 ) {
					delete expandedSections[page][section];
				}
			} );
		} );
		saveExpandedSections( expandedSections );
	}

	/**
	 * Given a heading, toggle it and any of its children
	 *
	 * @param {jQuery.Object} $heading A heading belonging to a section
	 * @ignore
	 */
	Toggler.prototype.toggle = function ( $heading ) {
		var indicator,
			wasExpanded = $heading.is( '.open-block' ),
			page = $heading.data( 'page' ),
			sectionId = $heading.data( 'section-number' );

		$heading.toggleClass( 'open-block' );
		$heading.data( 'indicator' ).remove();

		/**
		 * @event toggled
		 */
		this.emit( 'toggled', wasExpanded, sectionId );
		indicator = new Icon( arrowOptions ).prependTo( $heading );
		$heading.data( 'indicator', indicator );

		$heading.next()
			.toggleClass( 'open-block' )
			.attr( {
				'aria-pressed': !wasExpanded,
				'aria-expanded': !wasExpanded
			} );

		M.emit( 'section-toggled', wasExpanded, sectionId );

		if ( !browser.isWideScreen() ) {
			storeSectionToggleState( $heading, page );
		}
	};

	/**
	 * Enables toggling via enter and space keys
	 *
	 * @ignore
	 * @param {Toggler} toggler instance.
	 * @param {jQuery.Object} $heading
	 */
	function enableKeyboardActions( toggler, $heading ) {
		$heading.on( 'keypress', function ( ev ) {
			if ( ev.which === 13 || ev.which === 32 ) {
				// Only handle keypresses on the "Enter" or "Space" keys
				toggler.toggle.call( toggler, $( this ) );
			}
		} ).find( 'a' ).on( 'keypress mouseup', function ( ev ) {
			ev.stopPropagation();
		} );
	}

	/**
	 * Reveals an element and its parent section as identified by it's id
	 *
	 * @ignore
	 * @param {String} selector A css selector that identifies a single element
	 * @param {Object} $container jQuery element to search in
	 */
	Toggler.prototype.reveal = function ( selector, $container ) {
		var $target, $heading;

		// jQuery will throw for hashes containing certain characters which can break toggling
		try {
			$target = $container.find( escapeHash( selector ) );
			$heading = $target.parents( '.collapsible-heading' );
			// The heading is not a section heading, check if in a content block!
			if ( !$heading.length ) {
				$heading = $target.parents( '.collapsible-block' ).prev( '.collapsible-heading' );
			}
			if ( $heading.length && !$heading.hasClass( 'open-block' ) ) {
				this.toggle( $heading );
			}
			if ( $heading.length ) {
				// scroll again after opening section (opening section makes the page longer)
				window.scrollTo( 0, $target.offset().top );
			}
		} catch ( e ) {}
	};

	/**
	 * Enables section toggling in a given container when wgMFCollapseSectionsByDefault
	 * is enabled.
	 *
	 * @param {jQuery.Object} $container to apply toggling to
	 * @param {String} prefix a prefix to use for the id.
	 * @param {Page} [page] to allow storage of session for future visits
	 * @param {Page} [isClosed] whether the element should begin closed
	 * @private
	 * @constructor
	 */
	Toggler.prototype._enable = function ( $container, prefix, page, isClosed ) {
		var tagName, expandSections, indicator,
			$firstHeading,
			self = this,
			collapseSectionsByDefault = mw.config.get( 'wgMFCollapseSectionsByDefault' );

		// Also allow .section-heading if some extensions like Wikibase
		// want to toggle other headlines than direct descendants of $container.
		$firstHeading = $container.find( '> h1,> h2,> h3,> h4,> h5,> h6,.section-heading' ).eq( 0 );
		tagName = $firstHeading.prop( 'tagName' ) || 'H1';

		if ( collapseSectionsByDefault === undefined ) {
			// Old default behavior if on cached output
			collapseSectionsByDefault = true;
		}
		expandSections = !collapseSectionsByDefault ||
			( context.isBetaGroupMember() && settings.get( 'expandSections', true ) === 'true' );

		$container.children( tagName ).each( function ( i ) {
			var $heading = $( this ),
				$indicator = $heading.find( '.indicator' ),
				id = prefix + 'collapsible-block-' + i;
			// Be sure there is a div wrapping the section content.
			// Otherwise, collapsible sections for this page is not enabled.
			if ( $heading.next().is( 'div' ) ) {
				$heading
					.addClass( 'collapsible-heading ' )
					.data( 'section-number', i )
					.data( 'page', page )
					.attr( {
						tabindex: 0,
						'aria-haspopup': 'true',
						'aria-controls': id
					} )
					.on( 'click', function ( ev ) {
						// don't toggle, if the click target was a link (a link in a section heading) - T117880
						if ( !ev.target.href ) {
							// prevent taps/clicks on edit button after toggling (bug 56209)
							ev.preventDefault();
							self.toggle.call( self, $( this ) );
						}
					} );

				indicator = new Icon( arrowOptions );
				if ( $indicator.length ) {
					// replace the existing indicator
					$indicator.replaceWith( indicator.$el );
				} else {
					indicator.prependTo( $heading );
				}
				$heading.data( 'indicator', indicator.$el );
				$heading.next( 'div' )
					.addClass( 'collapsible-block' )
					.eq( 0 )
					.attr( {
						// We need to give each content block a unique id as that's
						// the only way we can tell screen readers what element we're
						// referring to (aria-controls)
						id: id,
						'aria-pressed': 'false',
						'aria-expanded': 'false'
					} );

				enableKeyboardActions( self, $heading );
				if ( !isClosed && browser.isWideScreen() || expandSections ) {
					// Expand sections by default on wide screen devices or if the expand sections setting is set
					self.toggle.call( self, $heading );
				}
			}
		} );

		/**
		 * Checks the existing hash and toggles open any section that contains the fragment.
		 *
		 * @method
		 * @ignore
		 */
		function checkHash() {
			var hash = window.location.hash;
			if ( hash.indexOf( '#' ) === 0 ) {
				self.reveal( hash, $container );
			}
		}

		/**
		 * Checks the value of wgInternalRedirectTargetUrl and reveals the collapsed
		 * section that contains it if present
		 *
		 * @method
		 * @ignore
		 */
		function checkInternalRedirectAndHash() {
			var internalRedirect = mw.config.get( 'wgInternalRedirectTargetUrl' ),
				internalRedirectHash = internalRedirect ? internalRedirect.split( '#' )[1] : false;

			if ( internalRedirectHash ) {
				window.location.hash = internalRedirectHash;
				self.reveal( internalRedirectHash, $container );
			}
		}

		checkInternalRedirectAndHash();
		checkHash( this );
		// Restricted to links created by editors and thus outside our control
		$container.find( 'a' ).on( 'click', function () {
			// the link might be an internal link with a hash.
			// if it is check if we need to reveal any sections.
			if ( $( this ).attr( 'href' ) !== undefined &&
				$( this ).attr( 'href' ).indexOf( '#' ) > -1
			) {
				checkHash( this );
			}
		} );

		if ( !browser.isWideScreen() ) {
			expandStoredSections( this, $container, page );
			cleanObsoleteStoredSections( page );
		}
	};

	Toggler._getExpandedSections = getExpandedSections;
	Toggler._expandStoredSections = expandStoredSections;
	Toggler._cleanObsoleteStoredSections = cleanObsoleteStoredSections;

	M.define( 'mobile.toggle/Toggler', Toggler );

}( mw.mobileFrontend, jQuery ) );
