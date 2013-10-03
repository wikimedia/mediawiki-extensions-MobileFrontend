( function( M, $ ) {

	/**
	 * Escape dots and colons in a hash, jQuery doesn't like them beause they
	 * look like CSS classes and pseudoclasses. See
	 * http://bugs.jquery.com/ticket/5241
	 * http://stackoverflow.com/questions/350292/how-do-i-get-jquery-to-select-elements-with-a-period-in-their-id
	 *
	 * @param {String} hash A hash to escape
	 */
	function escapeHash( hash ) {
		return hash.replace( /(:|\.)/g, '\\$1' );
	}

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
			$target = $( escapeHash( selector ) );
			$heading = $target.closest( '.section_heading' ).eq( 0 );

			if ( $heading.length > 0 && !$heading.hasClass( 'openSection' ) ) {
				toggle( $heading );
				// scroll again after opening section (opening section makes the page longer)
				window.scrollTo( 0, $target.offset().top );
			}
		} catch ( e ) {}
	}

	function init() {
		var $page = $( '#content' ), tagName = 'h2', additionalClassNames = '';

		// in beta expand all sections by default
		if ( M.isWideScreen() && mw.config.get( 'wgMFMode' ) !== 'stable' ) {
			additionalClassNames = 'openSection';
		}

		$( 'html' ).removeClass( 'stub' );
		if ( $page.find( 'h1' ).length > 0 ) {
			tagName = 'h1';
		}
		$page.find( tagName ).addClass( [ 'section_heading', additionalClassNames ].join( ' ' ) );
		$page.find( '.section_heading' ).next( 'div' ).addClass( [ 'content_block', additionalClassNames ].join( ' ' ) );

		// use mouseup because mousedown blocks the click event and links
		// in headings won't work
		// FIXME change when micro.tap.js in stable
		$( '.section_heading' ).on( M.tapEvent( 'mouseup' ), function() {
			toggle( $( this ) );
		} );
		// FIXME: remove when this class is no longer in cached pages
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
	if ( mw.config.get( 'wgNamespaceNumber' ) !== mw.config.get( 'wgNamespaceIds' ).special && !mw.config.get( 'wgIsMainPage' ) ) {
		init();
	}

	M.on( 'page-loaded', function( page ) {
		if ( !page.isMainPage() ) {
			init();
		}
	} );

	// FIXME: Temporary workaround while toggle-dynamic is not in stable
	// (needed for dynamic section loading after editing)
	if ( mw.config.get( 'wgMFMode' ) === 'stable' ) {
		M.on( 'section-toggle', function( $section ) {
			var $content = $section.next(),
				content = $content.data( 'content' );
			if ( content ) {
				$content.html( content ).data( 'content', false );
			}
		} );
	}

	M.define( 'toggle', {
		escapeHash: escapeHash,
		reveal: reveal,
		toggle: toggle,
		enable: init
	} );

}( mw.mobileFrontend, jQuery ) );
