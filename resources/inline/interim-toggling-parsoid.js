// Note this inline fragment will be run by old legacy browsers,
// so should stick to ES5-compatible syntax and guard modern web APIs.

// Only handle expansions during load to match legacy parser behavior.
function mfTempClickHandler( ev ) {
	// eslint-disable-next-line no-var
	var target = ev.target;
	if ( target && target.closest ) {
		// eslint-disable-next-line no-var
		var heading = target.closest( '.mw-heading' );
		if ( heading && heading.classList ) {
			// eslint-disable-next-line no-var
			var content = heading.nextSibling;
			if ( content && content.classList ) {
				// This should be kept in sync with sectionCollapsing.js's
				// setCollapsedHeadingState()
				content.classList.add( 'mf-collapsible-content' );
				content.hidden = false;
			}
		}
	}
}

document.addEventListener( 'click', mfTempClickHandler );
