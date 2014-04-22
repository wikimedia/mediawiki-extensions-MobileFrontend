( function( M, $ ) {

	/**
	 * Given a heading, toggle it and any of its children
	 * emits a section-toggle event
	 *
	 * @param {jQuery.Object} $heading A heading belonging to a section
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
			$target = $( M.escapeHash( selector ) );
			$heading = $target.closest( '.section_heading' ).eq( 0 );

			if ( $heading.length > 0 && !$heading.hasClass( 'openSection' ) ) {
				toggle( $heading );
				// scroll again after opening section (opening section makes the page longer)
				window.scrollTo( 0, $target.offset().top );
			}
		} catch ( e ) {}
	}

	function init( $page ) {
		var tagName = 'h2', $headings, expandSections,
			collapseSectionsByDefault = mw.config.get( 'wgMFCollapseSectionsByDefault' );
		$page = $page || $( '#content' );

		$( 'html' ).removeClass( 'stub' );
		if ( $page.find( 'h1' ).length > 0 ) {
			tagName = 'h1';
		}
		$page.find( tagName ).addClass( 'section_heading' );
		$headings = $page.find( '.section_heading' );
		$headings.next( 'div' ).addClass( 'content_block' );

		if ( collapseSectionsByDefault === undefined ) {
			// Old default behavior if on cached output
			collapseSectionsByDefault = true;
		}
		expandSections = !collapseSectionsByDefault || (M.isAlphaGroupMember() && M.settings.getUserSetting( 'expandSections', true ) === 'true');

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
			.on( M.tapEvent( 'mouseup' ), function( ev ) {
				// prevent taps/clicks on edit button after toggling (bug 56209)
				ev.preventDefault();
				toggle( $( this ) );
			} );

			if ( ( M.isWideScreen() && M.isBetaGroupMember() ) || expandSections ) {
				// Expand sections by default on wide screen devices (in beta and alpha), or if the expand sections setting is set (alpha only)
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
		M.emit( 'toggling-enabled', $headings );
	}

	// avoid this running on Watchlist
	if ( !M.inNamespace( 'special' ) && !mw.config.get( 'wgIsMainPage' ) ) {
		init();
	}

	M.on( 'page-loaded', function() {
		// don't pass page-loaded parameter
		init();
	} );

	// FIXME: Temporary workaround while toggle-dynamic is not in stable
	// (needed for dynamic section loading after editing)
	if ( !M.isAlphaGroupMember() || !M.isApp() ) {
		M.on( 'section-toggle', function( $section ) {
			var $content = $section.next(),
				content = $content.data( 'content' );
			if ( content ) {
				$content.html( content ).data( 'content', false );
			}
		} );
	}

	M.define( 'toggle', {
		reveal: reveal,
		toggle: toggle,
		enable: init
	} );

}( mw.mobileFrontend, jQuery ) );
