( function( M, $ ) {

var toggle = ( function() {

	/**
	 * Given a heading, toggle it and any of its children
	 * emits a section-toggle event
	 *
	 * @param {jQuery object} $heading A heading belonging to a section
	 */
	function toggle( $heading ) {
		$heading.toggleClass( 'openSection' );
		$heading.next().toggleClass( 'openSection' );
		M.emit( 'section-toggle', $heading );
	}

	/**
	 * Reveals an element and its parent section as identified by it's id
	 *
	 * @param {String} selector A css selector that identifies a single element
	 */
	function reveal( selector ) {
		var $target, $heading;

		// jQuery will throw for hashes containing certain characters which can break toggling
		try {
			$target = $( selector );
			$heading = $target.closest( '.section_heading' ).eq( 0 );

			if ( $heading.length > 0 && !$heading.hasClass( 'openSection' ) ) {
				toggle( $heading );
				// scroll again after opening section (opening section makes the page longer)
				window.scrollTo( 0, $target.offset().top );
			}
		} catch ( e ) {}
	}

	function init() {
		var $page = $( '#content' );
		$( 'html' ).removeClass( 'stub' );
		$page.find( 'h2' ).addClass( 'section_heading' );
		$page.find( '.section_heading' ).next( 'div' ).addClass( 'content_block' );

		// use mouseup because mousedown blocks the click event and links
		// in headings won't work
		// FIXME change when micro.tap.js in stable
		$( '.section_heading' ).on( M.tapEvent( 'mouseup' ), function() {
			toggle( $( this ) );
		} );
		$( '.section_anchors' ).remove();

		function checkHash() {
			var hash = window.location.hash;
			if ( hash.indexOf( '#' ) === 0 ) {
				reveal( hash );
			}
		}
		checkHash();
		$( '#content_wrapper a' ).on( 'click', checkHash );
	}

	// avoid this running on Watchlist
	if ( mw.config.get( 'wgNamespaceNumber' ) !== mw.config.get( 'wgNamespaceIds' ).special ) {
		init();
	}

	return {
		reveal: reveal,
		toggle: toggle,
		enable: init
	};

}());

M.define( 'toggle', toggle );
M.on( 'page-loaded', function() {
	toggle.enable();
} );
// FIXME: Temporary workaround while toggle-dynamic is not in stable
if ( mw.config.get( 'wgMFMode' ) === 'stable' ) {
	M.on( 'section-toggle', function( $section ) {
		var $content = $section.next(),
			content = $content.data( 'content' );
		if ( content ) {
			$content.html( content ).data( 'content', false );
		}
	} );
}

}( mw.mobileFrontend, jQuery ) );
