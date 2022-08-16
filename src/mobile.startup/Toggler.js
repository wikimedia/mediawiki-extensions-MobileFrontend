var browser = require( './Browser' ).getSingleton(),
	util = require( './util' ),
	escapeSelector = util.escapeSelector,
	arrowOptions = {
		name: 'expand',
		type: '',
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
	var expandedSections = mw.storage.session.getObject( 'expandedSections' ) || {};
	expandedSections[page.title] = expandedSections[page.title] || {};
	return expandedSections;
}

/**
 * Save expandedSections to sessionStorage
 *
 * @param {Object} expandedSections
 */
function saveExpandedSections( expandedSections ) {
	mw.storage.session.setObject(
		'expandedSections', expandedSections
	);
}

/**
 * Given an expanded heading, store it to sessionStorage.
 * If the heading is collapsed, remove it from sessionStorage.
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
			expandedSections[page.title][headline] = true;
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

	arrowOptions.rotation = wasExpanded ? 0 : 180;
	indicator = new Icon( arrowOptions );
	$heading.data( 'indicator' ).attr( 'class', indicator.getClassName() );

	$headingLabel.attr( 'aria-expanded', !wasExpanded );

	if ( $content.hasClass( 'open-block' ) ) {
		$content.removeClass( 'open-block' );
		// jquery doesn't allow custom values for the hidden attribute it seems.
		$content.get( 0 ).setAttribute( 'hidden', 'until-found' );
	} else {
		$content.addClass( 'open-block' );
		$content.removeAttr( 'hidden' );
	}

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
 * @param {string} id An element ID within the $container
 * @param {Object} $container jQuery element to search in
 * @param {Page} page
 * @return {boolean} Target ID was found
 */
Toggler.prototype.reveal = function ( id, $container, page ) {
	var $target;
	// jQuery will throw for hashes containing certain characters which can break toggling
	try {
		$target = $container.find( '#' + escapeSelector( id ) );
	} catch ( e ) {}
	if ( !$target || !$target.length ) {
		return false;
	}

	var $heading = $target.parents( '.collapsible-heading' );
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
	return true;
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
	// NB: 'expandSections' uses localStorage, unlike 'expandedSections' which uses sessionStorage
	expandSections = !collapseSectionsByDefault || mw.storage.get( 'expandSections' ) === 'true';

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
						// prevent taps/clicks on edit button after toggling (T58209)
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
				} )
				.on( 'beforematch', function () {
					self.toggle( $heading, page );
				} )
				.addClass( 'collapsible-block-js' )
				.get( 0 ).setAttribute( 'hidden', 'until-found' );

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

	/**
	 * Checks the existing hash and toggles open any section that contains the fragment.
	 *
	 * @method
	 */
	function checkHash() {
		// eslint-disable-next-line no-restricted-properties
		var hash = window.location.hash;
		if ( hash.indexOf( '#' ) === 0 ) {
			hash = hash.slice( 1 );
			// Per https://html.spec.whatwg.org/multipage/browsing-the-web.html#target-element
			// we try the raw fragment first, then the percent-decoded fragment.
			if ( !self.reveal( hash, $container, page ) ) {
				var decodedHash = mw.util.percentDecodeFragment( hash );
				if ( decodedHash ) {
					self.reveal( decodedHash, $container, page );
				}
			}
		}
	}

	/**
	 * Checks the value of wgInternalRedirectTargetUrl and sets the hash if present.
	 * checkHash() will reveal the collapsed section that contains it afterwards.
	 *
	 * @method
	 */
	function checkInternalRedirectAndHash() {
		var internalRedirect = mw.config.get( 'wgInternalRedirectTargetUrl' ),
			internalRedirectHash = internalRedirect ? internalRedirect.split( '#' )[1] : false;

		if ( internalRedirectHash ) {
			// eslint-disable-next-line no-restricted-properties
			window.location.hash = internalRedirectHash;
		}
	}

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
	}
};

Toggler._getExpandedSections = getExpandedSections;
Toggler._expandStoredSections = expandStoredSections;

module.exports = Toggler;
