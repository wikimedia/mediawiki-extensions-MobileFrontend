const isCollapsedByDefault = require( './isCollapsedByDefault' );

/**
 * Sets attributes on collapsible header based on collapsed state
 *
 * @method
 * @param {HTMLElement} heading span element containing heading text
 * @param {HTMLElement} icon span element for icon
 * @param {boolean} isCollapsed collapsed state to set
 * @ignore
 */
function setCollapsedHeadingState( heading, icon, isCollapsed ) {
	// update the dropdown state based on the content visibility
	if ( isCollapsed ) {
		heading.setAttribute( 'aria-expanded', 'false' );
		icon.classList.add( 'mf-icon-expand' );
		icon.classList.remove( 'mf-icon-collapse' );
	} else {
		heading.setAttribute( 'aria-expanded', 'true' );
		icon.classList.add( 'mf-icon-collapse' );
		icon.classList.remove( 'mf-icon-expand' );
	}

	/**
	 * Internal for use inside ReaderExperiments
	 *
	 * @event ~'readerExperiments.section-toggled'
	 * @memberof Hooks
	 */
	mw.hook( 'readerExperiments.section-toggled' ).fire( {
		heading,
		isExpanded: !isCollapsed
	} );
}

/**
 * Sets attributes on collapsible elements based on collapsed state
 *
 * @method
 * @param {HTMLElement} content div element containing collapsible content
 * @param {HTMLElement} heading div element containing heading text
 * @param {HTMLElement} icon span element for icon
 * @param {boolean} isCollapsed collapsed state to set
 * @ignore
 */
function setCollapsedState( content, heading, icon, isCollapsed ) {
	// show the content if hidden, hide if shown (until found so find in page works)
	content.hidden = isCollapsed ? 'until-found' : false;

	setCollapsedHeadingState( heading, icon, isCollapsed );
}

/**
 * Toggles collapsible state for a heading
 *
 * @method
 * @param {HTMLElement} content div element containing collapsible content
 * @param {HTMLElement} heading div element containing heading text
 * @param {HTMLElement} icon span element for icon
 * @ignore
 */
function toggle( content, heading, icon ) {
	const currentlyHidden = content.hidden;
	setCollapsedState( content, heading, icon,
		// This should reflect **new** collapsed state
		!currentlyHidden );
}

/**
 * Prepares a heading wrapper element for collapsible functionality.
 *
 * @method
 * @param {HTMLElement} wrapper The heading wrapper element
 * @param {HTMLElement} content The content element associated with this heading
 * @return {HTMLElement} The created icon element
 * @ignore
 */
function prepareHeadingWrapper( wrapper, content ) {
	wrapper.classList.add( 'mf-collapsible-heading' );
	content.classList.add( 'mf-collapsible-content' );

	// Update the heading wrapper to account for semantics of collapsing sections
	wrapper.setAttribute( 'tabindex', '0' );
	wrapper.setAttribute( 'role', 'button' );
	wrapper.setAttribute( 'aria-controls', content.id );

	// Create the dropdown arrow icon
	const icon = document.createElement( 'span' );
	icon.classList.add( 'mf-icon', 'mf-icon--small', 'mf-collapsible-icon' );
	icon.setAttribute( 'aria-hidden', true );
	wrapper.prepend( icon );

	return icon;
}

/**
 * Attaches event listeners to a heading wrapper for collapsible functionality.
 *
 * @method
 * @param {HTMLElement} wrapper The heading wrapper element
 * @param {HTMLElement} content The content element associated with this heading
 * @param {HTMLElement} icon The icon element
 * @ignore
 */
function attachEventListeners( wrapper, content, icon ) {
	// T389820 toggle the icon by expanding the heading on match.
	content.addEventListener( 'beforematch', () => {
		setCollapsedHeadingState( wrapper, icon, false );
	} );

	// Register the click handler
	wrapper.addEventListener( 'click', ( ev ) => {
		// Only toggle if a non-link was clicked.
		// We don't want sections to collapse if the edit link is clicked for example.
		const clickedLink = ev.target.closest( 'a' );
		if ( !clickedLink ) {
			toggle( content, wrapper, icon );
		}
	} );

	// Register the keypress handler
	wrapper.addEventListener( 'keypress', ( ev ) => {
		// Only toggle if a non-link was clicked.
		// We don't want sections to collapse if the edit link is clicked for example.
		const clickedLink = ev.target.closest( 'a' );
		// Only handle keypresses on the "Enter" or "Space" keys
		if ( !clickedLink && ( ev.which === 13 || ev.which === 32 ) ) {
			toggle( content, wrapper, icon );
		}
	} );
}

/**
 * Queries for an element by its ID within a container.
 *
 * @method
 * @param {HTMLElement} container The container element
 * @param {string} id The element ID to search for
 * @return {HTMLElement|null} The found element, or null
 * @ignore
 */
function queryById( container, id ) {
	try {
		return container.querySelector( '#' + CSS.escape( id ) );
	} catch ( e ) {
		return null;
	}
}

/**
 * Finds the element targeted by the current URL hash fragment.
 * Tries the raw fragment first, then the percent-decoded fragment per the
 * HTML spec: https://html.spec.whatwg.org/multipage/browsing-the-web.html#target-element
 *
 * @method
 * @param {HTMLElement} container The container element
 * @return {HTMLElement|null} The target element, or null
 * @ignore
 */
function findFragmentTarget( container ) {
	// eslint-disable-next-line no-restricted-properties
	const hash = window.location.hash;
	if ( hash.indexOf( '#' ) !== 0 ) {
		return null;
	}
	const id = hash.slice( 1 );
	const target = queryById( container, id );
	if ( target ) {
		return target;
	}
	const decodedId = mw.util.percentDecodeFragment( id );
	if ( decodedId ) {
		return queryById( container, decodedId );
	}
	return null;
}

/**
 * Expands the section containing the given target element.
 * Adapted from reveal() in Toggler.js (used with Legacy parser).
 *
 * @method
 * @param {HTMLElement} target The target element to reveal
 * @ignore
 */
function expandSectionForTarget( target ) {
	// Find the collapsible heading - first check if target is inside a collapsible heading
	let heading = target.closest( '.mf-collapsible-heading' );

	// If not in heading, check if it's in collapsible content
	if ( !heading ) {
		const content = target.closest( '.mf-collapsible-content' );
		if ( content ) {
			heading = content.previousElementSibling;
			if ( heading && !heading.classList.contains( 'mf-collapsible-heading' ) ) {
				heading = null;
			}
		}
	}

	// If we found a heading and it's collapsed, expand it
	if ( heading && heading.getAttribute( 'aria-expanded' ) === 'false' ) {
		const content = heading.nextElementSibling;
		const icon = heading.querySelector( '.mf-collapsible-icon' );
		if ( content && icon ) {
			setCollapsedState( content, heading, icon, false );
		}
	}

	// Scroll to target after expanding (expanding makes page longer)
	setTimeout( () => {
		target.scrollIntoView();
	}, 250 );
}

/**
 * Checks the current URL hash and expands any section containing the fragment.
 *
 * @method
 * @param {HTMLElement} container The container element
 * @ignore
 */
function checkHash( container ) {
	const target = findFragmentTarget( container );
	if ( target ) {
		expandSectionForTarget( target );
	}
}

/**
 * Checks the value of wgInternalRedirectTargetUrl and sets the hash if present.
 * checkHash() will expand the collapsed section that contains it afterwards.
 *
 * @method
 * @ignore
 */
function checkInternalRedirectAndHash() {
	const internalRedirect = mw.config.get( 'wgInternalRedirectTargetUrl' );
	const internalRedirectHash = internalRedirect ? internalRedirect.split( '#' )[ 1 ] : false;

	if ( internalRedirectHash ) {
		// eslint-disable-next-line no-restricted-properties
		window.location.hash = internalRedirectHash;
	}
}

/**
 * Initialises collapsing code.
 *
 * @method
 * @param {HTMLElement} container to enable collapsing on
 * @ignore
 */
function init( container ) {
	// These classes override site settings and user preferences. For example:
	// * ...-collapsed used on talk pages by DiscussionTools. (T321618, T322628)
	// * ...-expanded used in previews (T336572)
	let isCollapsed;
	const override = container.closest( '.collapsible-headings-collapsed, .collapsible-headings-expanded' );
	if ( override ) {
		isCollapsed = override.classList.contains( 'collapsible-headings-collapsed' );
	} else {
		// Check site config and user preferences
		isCollapsed = isCollapsedByDefault();
	}

	const headingWrappers = Array.from(
		container.querySelectorAll( '.mw-parser-output > section > .mw-heading' )
	);

	// Handle internal redirect hash before collapsing so we know the final hash.
	checkInternalRedirectAndHash();
	// Find the fragment target to avoid collapsing the section that contains it.
	// This works together with the CSS :has(:target) rule in main.less to
	// ensure the targeted section is visible from first paint without a flash.
	const fragmentTarget = findFragmentTarget( container );

	headingWrappers.forEach( ( wrapper ) => {
		const content = wrapper.nextElementSibling;
		if ( content.tagName !== 'DIV' ) {
			return;
		}
		const icon = prepareHeadingWrapper( wrapper, content );

		attachEventListeners( wrapper, content, icon );
		// Skip collapsing if this section contains the fragment target
		const shouldCollapse = isCollapsed &&
			!( fragmentTarget &&
				( content.contains( fragmentTarget ) || wrapper.contains( fragmentTarget ) ) );
		setCollapsedState( content, wrapper, icon, shouldCollapse );
	} );

	window.addEventListener( 'hashchange', () => checkHash( container ) );
}

module.exports = { init };
