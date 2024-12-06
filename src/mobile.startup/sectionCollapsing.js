const isCollapsedByDefault = require( './isCollapsedByDefault' );

/**
 * Sets attributes on collapsible elements based on collapsed state
 *
 * @method
 * @param {HTMLElement} container div element containing collapsible heading
 * @param {HTMLElement} headingText span element containing heading text
 * @param {HTMLElement} icon span element for icon
 * @param {boolean} isCollapsed collapsed state to set
 * @ignore
 */
function setCollapsedState( content, headingText, icon, isCollapsed ) {
	// show the content if hidden, hide if shown (until found so find in page works)
	content.hidden = isCollapsed ? 'until-found' : false;

	// update the dropdown state based on the content visibility
	if ( isCollapsed ) {
		headingText.setAttribute( 'aria-expanded', 'true' );
		icon.classList.add( 'mf-icon-expand' );
		icon.classList.remove( 'mf-icon-collapse' );
	} else {
		headingText.setAttribute( 'aria-expanded', 'false' );
		icon.classList.add( 'mf-icon-collapse' );
		icon.classList.remove( 'mf-icon-expand' );
	}
}

/**
 * Toggles collapsible state for a heading
 *
 * @method
 * @param {HTMLElement} container div element containing collapsible heading
 * @param {HTMLElement} headingText span element containing heading text
 * @param {HTMLElement} icon span element for icon
 * @ignore
 */
function toggle( content, headingText, icon ) {
	const currentlyHidden = content.hidden;
	setCollapsedState( content, headingText, icon, !currentlyHidden );
}

/**
 * Initialises collapsing code.
 *
 * @method
 * @param {HTMLElement} container to enable collapsing on
 * @ignore
 */
function init( container ) {
	const isCollapsed = isCollapsedByDefault();
	const headingWrappers = Array.from( container.querySelectorAll( '.mw-parser-output > section > .mw-heading' ) );
	headingWrappers.forEach( ( wrapper ) => {
		wrapper.classList.add( 'mf-collapsible-heading' );
		const heading = wrapper.firstElementChild;

		// Add class to collapsible content
		// Used in CSS before hidden attribute is added
		const content = wrapper.nextElementSibling;
		content.classList.add( 'mf-collapsible-content' );

		// Update the heading text to account for semantics of collapsing sections
		const headingText = document.createElement( 'span' );
		headingText.textContent = heading.textContent;
		headingText.setAttribute( 'tabindex', '0' );
		headingText.setAttribute( 'role', 'button' );
		headingText.setAttribute( 'aria-controls', content.id );

		// Create the dropdown arrow
		const icon = document.createElement( 'span' );
		icon.classList.add( 'mf-icon', 'mf-icon--small', 'mf-collapsible-icon' );
		icon.setAttribute( 'aria-hidden', true );

		setCollapsedState( content, headingText, icon, isCollapsed );

		// Replace contents of the heading element
		heading.innerHTML = '';
		heading.append( icon );
		heading.append( headingText );

		// Register the click handlers
		heading.addEventListener( 'click', () => toggle( content, headingText, icon ) );
	} );
}

module.exports = { init };
