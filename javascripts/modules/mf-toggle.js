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
		var isCollapsed = $heading.is( '.openSection' );

		$heading.toggleClass( 'openSection' );
		$heading.next()
			.toggleClass( 'openSection' )
			.attr( {
				'aria-pressed': !isCollapsed,
				'aria-expanded': !isCollapsed
			} );

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
		var $page = $( '#content' ), tagName = 'h2', $headings;

		$( 'html' ).removeClass( 'stub' );
		if ( $page.find( 'h1' ).length > 0 ) {
			tagName = 'h1';
		}
		$page.find( tagName ).addClass( 'section_heading' );
		$headings = $page.find( '.section_heading' );
		$headings.next( 'div' ).addClass( 'content_block' );

		$headings.each( function ( i ) {
			var $elem = $( this ),
				id = 'content_block_' + i;

			$elem.next( '.content_block' ).eq(0)
				.attr( {
					// We need to give each content block a unique id as that's
					// the only way we can tell screen readers what element we're
					// referring to (aria-controls)
					id: id,
					'aria-pressed': 'false',
					'aria-expanded': 'false'
				} );

			$elem.attr( {
				role: 'button',
				tabindex: 0,
				'aria-haspopup': 'true',
				'aria-controls': id
			} )
			// FIXME change when micro.tap.js in stable
			.on( M.tapEvent( 'mouseup' ), function() {
				toggle( $( this ) );
			} );

			// In beta expand sections by default on wide screen devices (in beta and alpha)
			if ( M.isWideScreen() && mw.config.get( 'wgMFMode' ) !== 'stable' ) {
				toggle( $elem );
			}
		} );

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
	if ( !M.inNamespace( 'special' ) && !mw.config.get( 'wgIsMainPage' ) ) {
		init();
	}

	M.on( 'page-loaded', function( page ) {
		if ( !page.isMainPage() ) {
			init();
		}
	} );

	// FIXME: Temporary workaround while toggle-dynamic is not in stable
	// (needed for dynamic section loading after editing)
	if ( mw.config.get( 'wgMFMode' ) !== 'alpha' ) {
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
