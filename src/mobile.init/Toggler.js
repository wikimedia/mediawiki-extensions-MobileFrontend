const
	util = require( '../mobile.startup/util' ),
	escapeSelector = util.escapeSelector,
	arrowOptions = {
		icon: 'expand',
		isSmall: true,
		additionalClassNames: 'indicator'
	},
	Icon = require( '../mobile.startup/Icon' );
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
 * Toggling can be disabled on a specific heading by adding the
 * collapsible-heading-button-disabled class (or collapsible-heading-disabled
 * for backward compatibility).
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
			// These classes override site settings and user preferences. For example:
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
	 * Gets the heading element (h1-h6) if it exists, otherwise returns the wrapper
	 *
	 * @private
	 * @param {HTMLElement} wrapperElement The wrapper element
	 * @return {HTMLElement} The heading element or wrapper
	 */
	_getHeadingTarget( wrapperElement ) {
		const headingElement = wrapperElement.querySelector( 'h1, h2, h3, h4, h5, h6' );
		return headingElement || wrapperElement;
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
		let $button = $heading.data( 'button' ) || $heading.find( 'button.collapsible-heading-button' );
		if ( !$button.length ) {
			// TODO: Remove after 14 days
			// Backward compatibility: Old cached HTML has collapsible-heading on wrapper div
			// Fallback for headings without button (old structure)
			$button = $heading;
		}

		// TODO: Remove after 14 days
		// Backward compatibility: Old cached HTML may have collapsible-heading-disabled
		if ( !fromSaved && ( $button.hasClass( 'collapsible-heading-button-disabled' ) || $button.hasClass( 'collapsible-heading-disabled' ) ) ) {
			return false;
		}

		// Get the target element (heading element or wrapper for backward compatibility)
		const target = this._getHeadingTarget( $heading[0] );

		const wasExpanded = target.classList.contains( 'open-block' );

		target.classList.toggle( 'open-block' );
		// Ensure collapsible-heading class is present on heading element
		target.classList.add( 'collapsible-heading' );

		arrowOptions.rotation = wasExpanded ? 0 : 180;
		const newIndicator = new Icon( arrowOptions );
		const $indicatorElement = $heading.data( 'indicator' ) || $button.find( '.indicator' );
		if ( $indicatorElement && $indicatorElement.length ) {
			$indicatorElement.replaceWith( newIndicator.$el );
			$heading.data( 'indicator', newIndicator.$el );
		}

		$button.attr( 'aria-expanded', !wasExpanded ? 'true' : 'false' );

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
			 * Internal for use inside ReaderExperiments
			 *
			 * @event ~'readerExperiments.section-toggled'
			 * @memberof Hooks
			 */
			mw.hook( 'readerExperiments.section-toggled' ).fire( {
				heading: $heading.get( 0 ),
				isExpanded: !wasExpanded
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

		// TODO: Remove after 14 days
		// Backward compatibility: Old cached HTML has .collapsible-heading on wrapper div
		// Old structure: <div class="section-heading collapsible-heading">...</div>
		let $heading = $target.parents( '.collapsible-heading, .section-heading' );

		// The heading is not a section heading, check if in a content block!
		if ( !$heading.length ) {
			$heading = $target.parents( '.collapsible-block' ).prev( '.section-heading' );
		}
		if ( $heading.length ) {
			const $button = $heading.data( 'button' ) || $heading.find( 'button.collapsible-heading-button' );
			// TODO: Remove after 14 days
			// Backward compatibility: Old cached HTML - check heading directly if no button
			if ( $button.length ) {
				const headingTarget = this._getHeadingTarget( $heading[0] );
				if ( !headingTarget.classList.contains( 'open-block' ) ) {
					this.toggle( $heading );
				}
			} else if ( $heading.hasClass( 'collapsible-heading' ) && !$heading.hasClass( 'open-block' ) ) {
				// Old structure: heading has collapsible-heading class directly
				this.toggle( $heading );
			}
		}
		if ( $heading.length ) {
			// scroll again after opening section (opening section makes the page longer)
			window.scrollTo( 0, $target.offset().top );
		}
		return true;
	}

	/**
	 * Creates a button element inside a heading to preserve heading semantics.
	 * Following W3C ARIA accordion pattern: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/examples/accordion/
	 *
	 * @private
	 * @param {HTMLElement} wrapperElement The wrapper element
	 * @param {string} id The ID for aria-controls
	 * @param {boolean} initiallyCollapsed Whether the section starts collapsed
	 * @param {jQuery.Object} $serverIndicator Optional server-rendered indicator to reuse
	 * @return {HTMLElement} The created button element
	 */
	_createHeadingButton( wrapperElement, id, initiallyCollapsed, $serverIndicator ) {
		// Find the actual heading element (h1-h6) inside the wrapper using _getHeadingTarget
		const headingElement = this._getHeadingTarget( wrapperElement );
		// If _getHeadingTarget returned the wrapper itself, no heading element exists
		if ( headingElement === wrapperElement ) {
			return null;
		}

		const button = document.createElement( 'button' );
		button.classList.add( 'collapsible-heading-button' );
		button.type = 'button';
		button.setAttribute( 'aria-controls', id );
		button.setAttribute( 'aria-expanded', initiallyCollapsed ? 'false' : 'true' );

		// Create indicator with correct rotation state
		arrowOptions.rotation = !initiallyCollapsed ? 180 : 0;
		const indicator = new Icon( arrowOptions );

		if ( $serverIndicator && $serverIndicator.length ) {
			// Replace server-rendered indicator with new Icon instance
			$serverIndicator.replaceWith( indicator.$el );
		}
		button.insertBefore( indicator.$el[0], button.firstChild );

		Array.from( headingElement.childNodes ).forEach( ( node ) => {
			if ( node.nodeType === Node.TEXT_NODE ) {
				button.appendChild( document.createTextNode( node.textContent ) );
			} else if ( node.nodeType === Node.ELEMENT_NODE ) {
				if ( node.tagName === 'A' ) {
					button.appendChild( node );
				} else if ( !node.classList.contains( 'indicator' ) ) {
					button.appendChild( node );
				}
			}
		} );
		headingElement.innerHTML = '';
		headingElement.appendChild( button );
		return button;
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
				const initiallyCollapsed = this.isCollapsedByDefault();

				let $button = $heading.find( 'button.collapsible-heading-button' );
				// Get the target element (heading element or wrapper for backward compatibility)
				const target = this._getHeadingTarget( $heading[0] );
				// Check if content or heading element is already expanded from cached HTML
				const isExpanded = $content.hasClass( 'open-block' ) || target.classList.contains( 'open-block' );

				if ( !$button.length ) {
					// Use existing expanded state if available, otherwise use default
					const shouldBeCollapsed = isExpanded ? false : initiallyCollapsed;
					this._createHeadingButton( $heading[0], id, shouldBeCollapsed, $indicator );
					$button = $heading.find( 'button.collapsible-heading-button' );
				} else {
					// Button already exists (from previous run or cached HTML)
					// Clean up any duplicate server-rendered indicators outside the button
					const $buttonIndicator = $button.find( '.indicator' ).first();
					if ( $buttonIndicator.length ) {
						$heading.find( '.indicator' ).not( $buttonIndicator ).remove();
					}
				}

				target.classList.add( 'collapsible-heading' );

				$heading
					.data( 'section-number', i )
					.data( 'button', $button );

				// TODO: Remove after 14 days
				// Backward compatibility: Old cached HTML has click handler on wrapper div
				// If no button found, use wrapper div (old structure)
				if ( !$button.length && $heading.hasClass( 'collapsible-heading' ) ) {
					$button = $heading;
				}

				$button.on( 'click', ( ev ) => {
					// Don't toggle if clicking a link.
					// Headings with links are still collapsible - click elsewhere to toggle.
					// See T117880
					const clickedLink = ev.target.closest( 'a' );
					if ( !clickedLink ) {
						// prevent taps/clicks on edit button after toggling (T58209)
						ev.preventDefault();
						this.toggle( $heading );
					}
				} );

				const $indicatorElement = $button.find( '.indicator' ).first();
				$heading.data( 'indicator', $indicatorElement );
				$content
					.addClass( 'collapsible-block' )
					.attr( {
						// We need to give each content block a unique id as that's
						// the only way we can tell screen readers what element we're
						// referring to via `aria-controls`.
						id
					} )
					.on( 'beforematch', () => this.toggle( $heading ) )
					.addClass( 'collapsible-block-js' );

				// Respect existing expanded state from cached HTML
				if ( isExpanded ) {
					target.classList.add( 'open-block' );
					$content.addClass( 'open-block' );
					$content.removeAttr( 'hidden' );
				} else if ( initiallyCollapsed ) {
					$content.get( 0 ).setAttribute( 'hidden', 'until-found' );
				} else {
					target.classList.add( 'open-block' );
					$content.addClass( 'open-block' );
				}

				$button.attr( 'aria-expanded', ( isExpanded || !initiallyCollapsed ) ? 'true' : 'false' );
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

module.exports = Toggler;
