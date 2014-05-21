( function( M, $ ) {
	var eventName = M.tapEvent( 'mouseup' );

	/**
	 * Given a heading, toggle it and any of its children
	 * emits a section-toggle event
	 *
	 * @param {jQuery.Object} $heading A heading belonging to a section
	 */
	function toggle( $heading ) {
		var isCollapsed = $heading.is( '.openSection' );

		$heading.toggleClass( 'openSection' );
		if ( $heading.hasClass( 'openSection' ) ) {
			$heading.addClass( 'icon-arrow-up' ).removeClass( 'icon-arrow-down' );
		} else {
			$heading.removeClass( 'icon-arrow-up' ).addClass( 'icon-arrow-down' );
		}
		$heading.next()
			.toggleClass( 'openSection' )
			.attr( {
				'aria-pressed': !isCollapsed,
				'aria-expanded': !isCollapsed
			} );

		M.emit( 'section-toggle', $heading );
	}

	/**
	 * Enables toggling via enter and space keys
	 *
	 * @param {jQuery.Object} $heading
	 */
	function enableKeyboardActions( $heading ) {
		$heading.on( 'keypress', function( ev ) {
			if ( ev.which === 13 || ev.which === 32 ) {
				// Only handle keypresses on the "Enter" or "Space" keys
				toggle( $( this ) );
			}
		} ).find( 'a' ).on( 'keypress mouseup', function( ev ) {
			ev.stopPropagation();
		} );
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
			$heading = $target.parents( '.section_heading' );
			// The heading is not a section heading, check if in a content block!
			if ( !$heading.length ) {
				$heading = $target.parents( '.content_block' ).prev( '.section_heading' );
			}
			if ( $heading.length && !$heading.hasClass( 'openSection' ) ) {
				toggle( $heading );
				// scroll again after opening section (opening section makes the page longer)
				window.scrollTo( 0, $target.offset().top );
			}
		} catch ( e ) {}
	}

	function init( $page ) {
		var tagName, $headings, expandSections,
			$firstHeading,
			collapseSectionsByDefault = mw.config.get( 'wgMFCollapseSectionsByDefault' );
		$page = $page || $( '#content' );

		$( 'html' ).removeClass( 'stub' );
		$firstHeading = $page.find( 'h1,h2,h3,h4,h5,h6' ).eq(0);
		tagName = $firstHeading.prop( 'tagName' ) || 'H1';
		$page.find( tagName ).addClass( 'section_heading icon icon-text icon-15px  icon-arrow-down' );

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
			.on( eventName, function( ev ) {
				// prevent taps/clicks on edit button after toggling (bug 56209)
				ev.preventDefault();
				toggle( $( this ) );
			} );

			enableKeyboardActions( $elem );
			if ( M.isWideScreen() || expandSections ) {
				// Expand sections by default on wide screen devices or if the expand sections setting is set (alpha only)
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
		eventName: eventName,
		reveal: reveal,
		toggle: toggle,
		enable: init
	} );

}( mw.mobileFrontend, jQuery ) );
