function toggle( content, headingText, icon ) {
	const currentlyHidden = content.hidden;

	// show the content if hidden, hide if shown (until found so find in page works)
	content.hidden = currentlyHidden ? false : 'until-found';

	// update the dropdown state based on the content visibility
	if ( currentlyHidden ) {
		headingText.setAttribute( 'aria-expanded', 'true' );
		icon.classList.replace( 'mf-icon-expand', 'mf-icon-collapse' );
	} else {
		headingText.setAttribute( 'aria-expanded', 'false' );
		icon.classList.replace( 'mf-icon-collapse', 'mf-icon-expand' );
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
	const headingWrappers = Array.from( container.querySelectorAll( '.mf-section-0 section .mw-heading' ) );
	let highestHeadingLevel = 6;
	// Find which heading level to collapse
	headingWrappers.forEach( ( wrapper ) => {
		const headingClass = wrapper.getAttribute( 'class' ).match( /mw-heading\d/i );
		if ( headingClass ) {
			const level = headingClass[0].slice( -1 );
			highestHeadingLevel = Math.min( level, highestHeadingLevel );
		}
	} );

	headingWrappers.filter( ( wrapper ) =>
		// Only collapse the highest heading level (i.e. H1 is higher than H2)
		wrapper.classList.contains( `mw-heading${ highestHeadingLevel }` )
	).forEach( ( wrapper ) => {
		const heading = wrapper.firstElementChild;
		const content = wrapper.nextElementSibling;
		wrapper.classList.add( 'mf-collapsible-heading' );

		// Update the heading text to account for semantics of collapsing sections
		const headingText = document.createElement( 'span' );
		headingText.textContent = heading.textContent;
		headingText.setAttribute( 'tabindex', '0' );
		headingText.setAttribute( 'role', 'button' );
		headingText.setAttribute( 'aria-expanded', 'true' );
		headingText.setAttribute( 'aria-controls', content.id );

		// Create the dropdown arrow
		const icon = document.createElement( 'span' );
		icon.classList.add( 'mf-icon', 'mf-icon--small', 'mf-icon-collapse', 'indicator' );
		icon.setAttribute( 'aria-hidden', true );

		// Replace contents of the heading element
		heading.innerHTML = '';
		heading.append( icon );
		heading.append( headingText );

		// Register the click handlers
		heading.addEventListener( 'click', () => toggle( content, headingText, icon ) );
	} );
}

module.exports = { init };
