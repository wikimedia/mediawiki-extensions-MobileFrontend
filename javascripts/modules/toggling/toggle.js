( function( M, $ ) {
	var eventName = M.tapEvent( 'mouseup' );

	/**
	 * Given a heading, toggle it and any of its children
	 *
	 * @param {jQuery.Object} $heading A heading belonging to a section
	 */
	function toggle( $heading ) {
		var isCollapsed = $heading.is( '.open-block' );

		$heading.toggleClass( 'open-block' );
		if ( $heading.hasClass( 'open-block' ) ) {
			$heading.addClass( 'icon-arrow-up' ).removeClass( 'icon-arrow-down' );
		} else {
			$heading.removeClass( 'icon-arrow-up' ).addClass( 'icon-arrow-down' );
		}
		$heading.next()
			.toggleClass( 'open-block' )
			.attr( {
				'aria-pressed': !isCollapsed,
				'aria-expanded': !isCollapsed
			} );
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
			$heading = $target.parents( '.collapsible-heading' );
			// The heading is not a section heading, check if in a content block!
			if ( !$heading.length ) {
				$heading = $target.parents( '.collapsible-block' ).prev( '.collapsible-heading' );
			}
			if ( $heading.length && !$heading.hasClass( 'open-block' ) ) {
				toggle( $heading );
			}
			if ( $heading.length ) {
				// scroll again after opening section (opening section makes the page longer)
				window.scrollTo( 0, $target.offset().top );
			}
		} catch ( e ) {}
	}

	function enable( $page ) {
		var tagName, $headings, expandSections,
			$firstHeading,
			collapseSectionsByDefault = mw.config.get( 'wgMFCollapseSectionsByDefault' );
		$page = $page || $( '#content' );

		$( 'html' ).removeClass( 'stub' );
		$firstHeading = $page.find( 'h1,h2,h3,h4,h5,h6' ).eq(0);
		tagName = $firstHeading.prop( 'tagName' ) || 'H1';
		$page.find( tagName ).addClass( 'collapsible-heading icon icon-text icon-15px icon-arrow-down' );

		$headings = $page.find( '.collapsible-heading' );
		$headings.next( 'div' ).addClass( 'collapsible-block' );

		if ( collapseSectionsByDefault === undefined ) {
			// Old default behavior if on cached output
			collapseSectionsByDefault = true;
		}
		expandSections = !collapseSectionsByDefault || (M.isAlphaGroupMember() && M.settings.getUserSetting( 'expandSections', true ) === 'true');

		$headings.each( function ( i ) {
			var $elem = $( this ),
				id = 'collapsible-block-' + i;

			$elem.next( '.collapsible-block' ).eq(0)
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
			var internalRedirect = mw.config.get( 'wgInternalRedirectTargetUrl' ),
				internalRedirectHash = internalRedirect ? internalRedirect.split( '#' )[1] : false,
				hash = window.location.hash;

			if ( hash.indexOf( '#' ) === 0 ) {
				reveal( hash );
			} else if ( internalRedirectHash ) {
				window.location.hash = internalRedirectHash;
				reveal( internalRedirectHash );
			}
		}
		checkHash();
		$( '#content_wrapper a' ).on( 'click', checkHash );
	}

	function init( $container ) {
		// distinguish headings in content from other headings
		$( '#content' ).find( '> h1,> h2,> h3,> h4,> h5,> h6' ).addClass( 'section-heading' );
		enable( $container );
	}

	// avoid this running on Watchlist
	if ( !M.inNamespace( 'special' ) && !mw.config.get( 'wgIsMainPage' ) ) {
		if ( mw.config.get( 'wgMFPageSections' ) ) {
			init();
		}
	}

	M.on( 'page-loaded', function() {
		if ( mw.config.get( 'wgMFPageSections' ) ) {
			// don't pass page-loaded parameter
			init();
		}
	} );

	M.define( 'toggle', {
		eventName: eventName,
		reveal: reveal,
		toggle: toggle,
		enable: enable
	} );

}( mw.mobileFrontend, jQuery ) );
