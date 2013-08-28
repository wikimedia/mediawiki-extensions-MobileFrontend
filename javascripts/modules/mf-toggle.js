( function( M, $ ) {

var MIN_SECTIONS = 2, toggle = ( function() {

	function wm_toggle_section( section_id ) {
		$( '#section_' + section_id + ',#content_' + section_id ).toggleClass( 'openSection' );
		M.emit( 'section-toggle', section_id );
	}

	function wm_reveal_for_hash( hash ) {
		var $target, $p;

		// jQuery will throw for hashes containing certain characters which can break toggling
		try {
			$target = $( hash );
			$p = $target.closest( '.content_block, .section_heading' ).eq( 0 );

			if ( $p.length > 0 && !$p.hasClass( 'openSection' ) ) {
				wm_toggle_section( $p.attr( 'id' ).split( '_' )[1] );
			}
		} catch ( e ) {}
	}

	function init() {
		$( 'html' ).removeClass( 'stub' );
		function openSectionHandler() {
			var sectionName = this.id ? this.id.split( '_' )[1] : -1;
			if ( sectionName !== -1 ) {
				wm_toggle_section( sectionName );
			}
		}

		// use mouseup because mousedown blocks the click event and links
		// in headings won't work
		// FIXME change when micro.tap.js in stable
		$( '.section_heading' ).on( M.tapEvent( 'mouseup' ), openSectionHandler );
		$( '.section_anchors' ).remove();

		function checkHash() {
			var hash = window.location.hash;
			if ( hash.indexOf( '#' ) === 0 ) {
				wm_reveal_for_hash( hash );
			}
		}
		checkHash();
		$( '#content_wrapper a' ).on( 'click', checkHash );
	}

	// page is not long enough to collapse so don't worry
	if ( $( '#content h2' ).length < MIN_SECTIONS ) {
		$( 'html' ).addClass( 'stub' );
	} else {
		init();
	}

	return {
		wm_reveal_for_hash: wm_reveal_for_hash,
		wm_toggle_section: wm_toggle_section,
		enable: init
	};

}());

M.define( 'toggle', toggle );
M.on( 'page-loaded', function() {
	toggle.enable();
} );
// FIXME: Temporary workaround while toggle-dynamic is not in stable
if ( mw.config.get( 'wgMFMode' ) === 'stable' ) {
	M.on( 'section-toggle', function( section_id ) {
		var $content = $( '#content_' + section_id ),
			content = $content.data( 'content' );
		if ( content ) {
			$content.html( content ).data( 'content', false );
		}
	} );
}

}( mw.mobileFrontend, jQuery ) );
