const
	util = require( './util' ),
	escapeSelector = util.escapeSelector,
	arrowOptions = {
		icon: 'expand',
		isSmall: true,
		additionalClassNames: 'indicator'
	},
	Icon = require( './Icon' );
const isCollapsedByDefault = require( './isCollapsedByDefault.js' );

/**
 * @typedef {Object} ToggledEvent
 * @prop {boolean} expanded True if section is opened, false if closed.
 * @prop {Page} page
 * @prop {jQuery.Object} $heading
 * @memberof module:mobile.startup
 * @ignore
 */

/**
 * A class for enabling toggling
 *
 * Toggling can be disabled on a sepcific heading by adding the
 * collapsible-heading-disabled class.
 */
class Toggler {
	/**
	 * @param {Object} options
	 * @param {OO.EventEmitter} options.eventBus Object used to emit section-toggled events.
	 * @param {jQuery.Object} options.$container to apply toggling to
	 * @param {string} options.prefix a prefix to use for the id.
	 * @param {Page} options.page to allow storage of session for future visits
	 */
	constructor( options ) {
		this.eventBus = options.eventBus;
		this.$container = options.$container;
		this.prefix = options.prefix;
		this.page = options.page;
		this._enable();
	}

	/**
	 * Check if sections should be collapsed by default
	 *
	 * @return {boolean}
	 */
	isCollapsedByDefault() {
		if ( this._isCollapsedByDefault === undefined ) {
			// Thess classes override site settings and user preferences. For example:
			// * ...-collapsed used on talk pages by DiscussionTools. (T321618, T322628)
			// * ...-expanded used in previews (T336572)
			const $override = this.$container.closest( '.collapsible-headings-collapsed, .collapsible-headings-expanded' );
			if ( $override.length ) {
				this._isCollapsedByDefault = $override.hasClass( 'collapsible-headings-collapsed' );
			} else {
				// Check site config
				this._isCollapsedByDefault = isCollapsedByDefault();
			}
		}
		return this._isCollapsedByDefault;
	}

	/**
	 * Given a heading, toggle it and any of its children
	 *
	 * @memberof Toggler
	 * @instance
	 * @param {jQuery.Object} $heading A heading belonging to a section
	 * @param {boolean} fromSaved Section is being toggled from a saved state
	 * @return {boolean}
	 */
	toggle( $heading, fromSaved ) {
		if ( !fromSaved && $heading.hasClass( 'collapsible-heading-disabled' ) ) {
			return false;
		}

		const wasExpanded = $heading.is( '.open-block' );

		$heading.toggleClass( 'open-block' );

		arrowOptions.rotation = wasExpanded ? 0 : 180;
		const newIndicator = new Icon( arrowOptions );
		const $indicatorElement = $heading.data( 'indicator' );
		if ( $indicatorElement ) {
			$indicatorElement.replaceWith( newIndicator.$el );
			$heading.data( 'indicator', newIndicator.$el );
		}

		$heading.attr( 'aria-expanded', !wasExpanded );

		const $content = $heading.next();
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
		mw.requestIdleCallback( () => {
			/**
			 * Global event emitted after a section has been toggled
			 *
			 * @event ~section-toggled
			 * @type {ToggledEvent}
			 * @memberof module:mobile.startup~Toggler
			 * @ignore
			 */

			this.eventBus.emit( 'section-toggled', {
				expanded: wasExpanded,
				$heading
			} );
			/**
			 * Internal for use inside ExternalGuidance.
			 *
			 * @event ~'mobileFrontend.section-toggled'
			 * @memberof Hooks
			 */
			mw.hook( 'mobileFrontend.section-toggled' ).fire( {
				expanded: wasExpanded,
				$heading
			} );
		} );

		return true;
	}

	/**
	 * Reveals an element and its parent section as identified by it's id
	 *
	 * @memberof Toggler
	 * @instance
	 * @param {string} id An element ID within the $container
	 * @return {boolean} Target ID was found
	 */
	reveal( id ) {
		let $target;
		// jQuery will throw for hashes containing certain characters which can break toggling
		try {
			$target = this.$container.find( '#' + escapeSelector( id ) );
		} catch ( e ) {}
		if ( !$target || !$target.length ) {
			return false;
		}

		let $heading = $target.parents( '.collapsible-heading' );
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
		return true;
	}

	/**
	 * Enables section toggling in a given container.
	 *
	 * @memberof Toggler
	 * @instance
	 * @private
	 */
	_enable() {

		// FIXME This should use .find() instead of .children(), some extensions like Wikibase
		// want to toggle other headlines than direct descendants of $container. (T95889)
		this.$container.children( '.section-heading' ).each( ( i, headingEl ) => {
			const $heading = this.$container.find( headingEl ),
				$indicator = $heading.find( '.indicator' ),
				id = this.prefix + 'collapsible-block-' + i;
			// Be sure there is a `section` wrapping the section content.
			// Otherwise, collapsible sections for this page is not enabled.
			if ( $heading.next().is( 'section' ) ) {
				const $content = $heading.next( 'section' );
				$heading
					.addClass( 'collapsible-heading ' )
					.data( 'section-number', i )
					.on( 'click', ( ev ) => {
						// don't toggle, if the click target was a link
						// (a link in a section heading)
						// See T117880
						const clickedLink = ev.target.closest( 'a' );
						if ( !clickedLink || !clickedLink.href ) {
							// prevent taps/clicks on edit button after toggling (T58209)
							ev.preventDefault();
							this.toggle( $heading );
						}
					} );
				$heading
					.attr( {
						tabindex: 0,
						role: 'button',
						'aria-controls': id,
						'aria-expanded': 'false'
					} );

				arrowOptions.rotation = !this.isCollapsedByDefault() ? 180 : 0;
				const indicator = new Icon( arrowOptions );
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
						id
					} )
					.on( 'beforematch', () => this.toggle( $heading ) )
					.addClass( 'collapsible-block-js' )
					.get( 0 ).setAttribute( 'hidden', 'until-found' );

				enableKeyboardActions( this, $heading );

				if ( !this.isCollapsedByDefault() ) {
					// Expand sections by default on wide screen devices
					// or if the expand sections setting is set.
					// The wide screen logic for determining whether to collapse sections initially
					// should be kept in sync with mobileoptions#initLocalStorageElements().
					this.toggle( $heading );
				}
			}
		} );

		/**
		 * Checks the existing hash and toggles open any section that contains the fragment.
		 *
		 * @method
		 */
		const checkHash = () => {
			// eslint-disable-next-line no-restricted-properties
			let hash = window.location.hash;
			if ( hash.indexOf( '#' ) === 0 ) {
				hash = hash.slice( 1 );
				// Per https://html.spec.whatwg.org/multipage/browsing-the-web.html#target-element
				// we try the raw fragment first, then the percent-decoded fragment.
				if ( !this.reveal( hash ) ) {
					const decodedHash = mw.util.percentDecodeFragment( hash );
					if ( decodedHash ) {
						this.reveal( decodedHash );
					}
				}
			}
		};

		/**
		 * Checks the value of wgInternalRedirectTargetUrl and sets the hash if present.
		 * checkHash() will reveal the collapsed section that contains it afterwards.
		 *
		 * @method
		 */
		function checkInternalRedirectAndHash() {
			const internalRedirect = mw.config.get( 'wgInternalRedirectTargetUrl' ),
				internalRedirectHash = internalRedirect ? internalRedirect.split( '#' )[1] : false;

			if ( internalRedirectHash ) {
				// eslint-disable-next-line no-restricted-properties
				window.location.hash = internalRedirectHash;
			}
		}

		checkInternalRedirectAndHash();
		checkHash();

		util.getWindow().on( 'hashchange', () => checkHash() );
	}
}

/**
 * Enables toggling via enter and space keys
 *
 * @param {Toggler} toggler instance.
 * @param {jQuery.Object} $heading
 * @ignore
 */
function enableKeyboardActions( toggler, $heading ) {
	$heading.on( 'keypress', ( ev ) => {
		if ( ev.which === 13 || ev.which === 32 ) {
			// Only handle keypresses on the "Enter" or "Space" keys
			toggler.toggle( $heading );
		}
	} ).find( 'a' ).on( 'keypress mouseup', ( ev ) => ev.stopPropagation() );
}

module.exports = Toggler;
