// Note this inline fragment will be run by old legacy browsers,
// so should stick to ES5-compatible syntax and guard modern web APIs.

// eslint-disable-next-line no-unused-vars
function mfTempOpenSection( id ) {
	// eslint-disable-next-line no-var
	var block = document.getElementById( 'mf-section-' + id );
	block.className += ' open-block';
	// The previous sibling to the content block is guaranteed to be the
	// associated heading due to mobileformatter. We need to add the same
	// class to flip the collapse arrow icon.
	// <h[1-6]>heading</h[1-6]><div id="mf-section-[1-9]+"></div>
	block.previousSibling.className += ' open-block';
	block.previousSibling.firstChild.className += ' mf-icon-rotate-flip';
}
