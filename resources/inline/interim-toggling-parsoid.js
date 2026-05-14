// Note this inline fragment will be run by old legacy browsers,
// so should stick to ES5-compatible syntax and guard modern web APIs.
//
// This prepended script is part of the toggling contract; the runtime
// half lives in src/mobile.init/sectionCollapsing.js. They share three
// invariants that must be keep in sync:
//   1. The heading wrapper is selected as `.mw-heading`.
//   2. The content element gets the `mf-collapsible-content` class.
//   3. Collapse state is communicated via the `hidden` attribute, so this
//      script's `content.hidden = false` is reversible by sectionCollapsing.
//   4. Register at most one document click handler. Remove any previous handler first.

// Only handle expansions during load to match legacy parser behavior.
if ( window.mfTempClickHandler ) {
	document.removeEventListener( 'click', window.mfTempClickHandler );
}
window.mfTempClickHandler = function mfTempClickHandler( ev ) {
	// eslint-disable-next-line no-var
	var target = ev.target;
	if ( target && target.closest ) {
		// eslint-disable-next-line no-var
		var heading = target.closest( '.mw-heading' );
		if ( heading && heading.classList ) {
			// eslint-disable-next-line no-var
			var content = heading.nextSibling;
			if ( content && content.classList ) {
				// Class + `hidden` must match sectionCollapsing.js's
				// prepareHeadingWrapper() and setCollapsedState() so that
				// init()'s `wasExpanded` check picks this state up.
				content.classList.add( 'mf-collapsible-content' );
				content.hidden = false;
			}
		}
	}
};

document.addEventListener( 'click', window.mfTempClickHandler );
