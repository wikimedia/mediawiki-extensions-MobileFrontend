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

	headingWrappers.forEach( ( wrapper ) => {
		const content = wrapper.nextElementSibling;
		if ( content.tagName !== 'DIV' ) {
			return;
		}
		const icon = prepareHeadingWrapper( wrapper, content );

		attachEventListeners( wrapper, content, icon );
		setCollapsedState( content, wrapper, icon, isCollapsed );
	} );
}

module.exports = { init };
