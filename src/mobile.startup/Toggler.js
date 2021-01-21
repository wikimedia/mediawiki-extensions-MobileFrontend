var browser = require( './Browser' ).getSingleton(),
	util = require( './util' ),
	escapeHash = util.escapeHash,
	arrowOptions = {
		name: 'expand',
		isSmall: true,
		additionalClassNames: 'indicator mw-ui-icon-flush-left'
	},
	Icon = require( './Icon' );

/**
 *
 * @typedef {Object} ToggledEvent
 * @prop {boolean} expanded True if section is opened, false if closed.
 * @prop {Page} page
 * @prop {boolean} isReferenceSection
 * @prop {jQuery.Object} $heading
 */

/**
 * A class for enabling toggling
 *
 * @class Toggler
 * @param {Object} options
 * @param {OO.EventEmitter} options.eventBus Object used to emit section-toggled events.
 * @param {jQuery.Object} options.$container to apply toggling to
 * @param {string} options.prefix a prefix to use for the id.
 * @param {Page} options.page to allow storage of session for future visits
 * @param {boolean} [options.isClosed]
 */
function Toggler( options ) {
	this.eventBus = options.eventBus;
	this._enable( options.$container, options.prefix, options.page, options.isClosed );
}

/**
 * Using the settings module looks at what sections were previously expanded on
 * existing page.
 *
 * @param {Page} page
 * @return {Object} representing open sections
 */
function getExpandedSections( page ) {
	var expandedSections = JSON.parse( mw.storage.session.get( 'expandedSections' ) || '{}' );
	expandedSections[page.title] = expandedSections[page.title] || {};
	return expandedSections;
}

/**
 * @param {Object} expandedSections
 * Save expandedSections to localStorage
 */
function saveExpandedSections( expandedSections ) {
	if ( mw.storage.get( 'expandedSections' ) ) {
		mw.storage.session.set(
			'expandedSections', JSON.stringify( mw.storage.get( 'expandedSections' ) )
		);
		// Clean up any old storage.
		// The following line can be removed 1 week after
		// Ib7c0a45fcf8645a900288a26d172781612fa1606 is deployed
		mw.storage.remove( 'expandedSections' );
	}
	mw.storage.session.set(
		'expandedSections', JSON.stringify( expandedSections )
	);
}

/**
 * Given an expanded heading, store it to localStorage.
 * If the heading is collapsed, remove it from localStorage.
 *
 * @param {jQuery.Object} $heading - A heading belonging to a section
 * @param {Page} page
 */
function storeSectionToggleState( $heading, page ) {
	var headline = $heading.find( 'span' ).attr( 'id' ),
		isSectionOpen = $heading.hasClass( 'open-block' ),
		expandedSections = getExpandedSections( page );

	if ( headline && expandedSections[page.title] ) {
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
 *
 * @param {Toggler} toggler
 * @param {jQuery.Object} $container
 * @param {Page} page
 */
function expandStoredSections( toggler, $container, page ) {
	var $sectionHeading, $headline,
		expandedSections = getExpandedSections( page ),
		$headlines = $container.find( '.section-heading span' );

	$headlines.each( function () {
		$headline = $container.find( this );
		$sectionHeading = $headline.parents( '.section-heading' );
		// toggle only if the section is not already expanded
		if (
			expandedSections[page.title][$headline.attr( 'id' )] &&
		!$sectionHeading.hasClass( 'open-block' )
		) {
			toggler.toggle( $sectionHeading, page );
		}
	} );
}

/**
 * Clean obsolete (saved more than a day ago) expanded sections from
 * localStorage.
 *
 * @param {Page} page
 */
function cleanObsoleteStoredSections( page ) {
	var now = ( new Date() ).getTime(),
		expandedSections = getExpandedSections( page ),
		// the number of days between now and the time a setting was saved
		daysDifference;
	Object.keys( expandedSections ).forEach( function ( page ) {
		var sections = expandedSections[ page ];
		// clean the setting if it is more than a day old
		Object.keys( sections ).forEach( function ( section ) {
			var timestamp = sections[ section ];
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
 * @memberof Toggler
 * @instance
 * @param {jQuery.Object} $heading A heading belonging to a section
 * @param {Page} page
 */
Toggler.prototype.toggle = function ( $heading, page ) {
	var indicator,
		self = this,
		wasExpanded = $heading.is( '.open-block' ),
		$headingLabel = $heading.find( '.mw-headline' ),
		$content = $heading.next();

	$heading.toggleClass( 'open-block' );
	$heading.data( 'indicator' ).remove();

	arrowOptions.rotation = wasExpanded ? 0 : 180;
	indicator = new Icon( arrowOptions ).prependTo( $heading );
	$heading.data( 'indicator', indicator );

	$headingLabel.attr( 'aria-expanded', !wasExpanded );

	$content.toggleClass( 'open-block' );

	/* T239418 We consider this event as a low-priority one and emit it asynchronously.
	This ensures that any logic associated with section toggling is async and not contributing
	directly to a slow click/press event handler.

	Currently costly reflow-inducing viewport size computation is being done for lazy-loaded
	images by the main listener to this event. */
	mw.requestIdleCallback( function () {
		/**
		 * Global event emitted after a section has been toggled
		 *
		 * @event section-toggled
		 * @type {ToggledEvent}
		 */

		self.eventBus.emit( 'section-toggled', {
			expanded: wasExpanded,
			isReferenceSection: Boolean( $content.attr( 'data-is-reference-section' ) ),
			$heading: $heading
		} );
	} );

	if ( !browser.isWideScreen() ) {
		storeSectionToggleState( $heading, page );
	}
};

/**
 * Enables toggling via enter and space keys
 *
 * @param {Toggler} toggler instance.
 * @param {jQuery.Object} $heading
 * @param {Page} page
 */
function enableKeyboardActions( toggler, $heading, page ) {
	$heading.on( 'keypress', function ( ev ) {
		if ( ev.which === 13 || ev.which === 32 ) {
			// Only handle keypresses on the "Enter" or "Space" keys
			toggler.toggle( $heading, page );
		}
	} ).find( 'a' ).on( 'keypress mouseup', function ( ev ) {
		ev.stopPropagation();
	} );
}

/**
 * Reveals an element and its parent section as identified by it's id
 *
 * @memberof Toggler
 * @instance
 * @param {string} selector A css selector that identifies a single element
 * @param {Object} $container jQuery element to search in
 * @param {Page} page
 */
Toggler.prototype.reveal = function ( selector, $container, page ) {
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
			this.toggle( $heading, page );
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
 * @memberof Toggler
 * @instance
 * @param {jQuery.Object} $container to apply toggling to
 * @param {string} prefix a prefix to use for the id.
 * @param {Page} page to allow storage of session for future visits
 * @param {boolean} [isClosed] whether the element should begin closed
 * @private
 */
Toggler.prototype._enable = function ( $container, prefix, page, isClosed ) {
	var tagName, expandSections, indicator, $content,
		$firstHeading,
		$link,
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
	expandSections = !collapseSectionsByDefault || mw.storage.session.get( 'expandSections' ) === 'true';

	$container.children( tagName ).each( function ( i ) {
		var isReferenceSection,
			$heading = $container.find( this ),
			$headingLabel = $heading.find( '.mw-headline' ),
			$indicator = $heading.find( '.indicator' ),
			id = prefix + 'collapsible-block-' + i;
		// Be sure there is a `section` wrapping the section content.
		// Otherwise, collapsible sections for this page is not enabled.
		if ( $heading.next().is( 'section' ) ) {
			$content = $heading.next( 'section' );
			isReferenceSection = Boolean( $content.attr( 'data-is-reference-section' ) );
			$heading
				.addClass( 'collapsible-heading ' )
				.data( 'section-number', i )
				.on( 'click', function ( ev ) {
					// don't toggle, if the click target was a link
					// (a link in a section heading)
					// See T117880
					if ( !ev.target.href ) {
						// prevent taps/clicks on edit button after toggling (bug 56209)
						ev.preventDefault();
						self.toggle( $heading, page );
					}
				} );
			$headingLabel
				.attr( {
					tabindex: 0,
					role: 'button',
					'aria-controls': id,
					'aria-expanded': 'false'
				} );

			arrowOptions.rotation = expandSections ? 180 : 0;
			indicator = new Icon( arrowOptions );

			if ( $indicator.length ) {
				// replace the existing indicator
				$indicator.replaceWith( indicator.$el );
			} else {
				indicator.prependTo( $heading );
			}
			$heading.data( 'indicator', indicator.$el );
			$content
				.addClass( 'collapsible-block' )
				.eq( 0 )
				.attr( {
					// We need to give each content block a unique id as that's
					// the only way we can tell screen readers what element we're
					// referring to via `aria-controls`.
					id: id
				} );

			enableKeyboardActions( self, $heading, page );
			if (
				!isReferenceSection && (
					!isClosed && browser.isWideScreen() || expandSections
				)
			) {
				// Expand sections by default on wide screen devices
				// or if the expand sections setting is set.
				// The wide screen logic for determining whether to collapse sections initially
				// should be kept in sync with mobileoptions#initLocalStorageElements().
				self.toggle( $heading, page );
			}
		}
	} );

	/* eslint-disable no-restricted-properties */
	/**
	 * Checks the existing hash and toggles open any section that contains the fragment.
	 *
	 * @method
	 */
	function checkHash() {
		var hash = window.location.hash;
		var decodedHash;
		if ( hash.indexOf( '#' ) === 0 ) {
			// Non-latin characters in the hash will be provided percent-encoded, which
			// jQuery would later fail to cope with.
			try {
				decodedHash = decodeURIComponent( hash );
				self.reveal( decodedHash, $container, page );
			} catch ( e ) {
				// sometimes decoding will fail e.g. T262599, T264914. If that happens ignore.
			}
		}
	}

	/**
	 * Checks the value of wgInternalRedirectTargetUrl and reveals the collapsed
	 * section that contains it if present
	 *
	 * @method
	 */
	function checkInternalRedirectAndHash() {
		var internalRedirect = mw.config.get( 'wgInternalRedirectTargetUrl' ),
			internalRedirectHash = internalRedirect ? internalRedirect.split( '#' )[1] : false;

		if ( internalRedirectHash ) {
			window.location.hash = internalRedirectHash;
			self.reveal( internalRedirectHash, $container, page );
		}
	}
	/* eslint-enable no-restricted-properties */

	checkInternalRedirectAndHash();
	checkHash();
	// Restricted to links created by editors and thus outside our control
	// T166544 - don't do this for reference links - they will be handled elsewhere
	$link = $container.find( 'a:not(.reference a)' );
	$link.on( 'click', function () {
		// the link might be an internal link with a hash.
		// if it is check if we need to reveal any sections.
		if ( $link.attr( 'href' ) !== undefined &&
		$link.attr( 'href' ).indexOf( '#' ) > -1
		) {
			checkHash();
		}
	} );
	util.getWindow().on( 'hashchange', function () {
		checkHash();
	} );

	if ( !browser.isWideScreen() && page ) {
		expandStoredSections( this, $container, page );
		cleanObsoleteStoredSections( page );
	}
};

Toggler._getExpandedSections = getExpandedSections;
Toggler._expandStoredSections = expandStoredSections;
Toggler._cleanObsoleteStoredSections = cleanObsoleteStoredSections;

module.exports = Toggler;
