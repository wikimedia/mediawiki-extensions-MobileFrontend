( function ( M, $ ) {
	var currentPageTitle =  M.getCurrentPage().title,
		Icon = M.require( 'Icon' ),
		iconUp = new Icon( { name: 'arrow-up', hasText: true } ),
		iconDown = new Icon( { name: 'arrow-down', hasText: true, additionalClassNames: 'icon-15px' } ),
		classOpen = iconUp.getGlyphClassName(),
		classClosed = iconDown.getGlyphClassName();

	function getExpandedSections() {
		var expandedSections = $.parseJSON(
			M.settings.getUserSetting( 'expandedSections', false ) || '{}'
		);
		expandedSections[currentPageTitle] = expandedSections[currentPageTitle] || {};
		return expandedSections;
	}

	/*
	 * Save expandedSections to localStorage
	 */
	function saveExpandedSections( expandedSections ) {
		M.settings.saveUserSetting(
			'expandedSections', JSON.stringify( expandedSections ), false
		);
	}

	/*
	 * Given an expanded heading, store it to localStorage.
	 * If the heading is collapsed, remove it from localStorage.
	 *
	 * @param {jQuery.Object} $heading - A heading belonging to a section
	 */
	function storeSectionToggleState( $heading ) {
		var headline = $heading.find( 'span' ).attr( 'id' ),
			isSectionOpen = $heading.hasClass( 'open-block' ),
			expandedSections = getExpandedSections();

		if ( headline ) {
			if ( isSectionOpen ) {
				expandedSections[currentPageTitle][headline] = ( new Date() ).getTime();
			} else {
				delete expandedSections[currentPageTitle][headline];
			}

			saveExpandedSections( expandedSections );
		}
	}

	/*
	 * Expand sections that were previously expanded before leaving this page.
	 */
	function expandStoredSections( $container ) {
		var $sectionHeading,
			expandedSections = getExpandedSections(),
			$headlines = $container.find( '.section-heading span' ), $headline;

		$headlines.each( function () {
			$headline = $( this );
			$sectionHeading = $headline.parents( '.section-heading' );
			// toggle only if the section is not already expanded
			if (
				expandedSections[currentPageTitle][$headline.attr( 'id' )] &&
				!$sectionHeading.hasClass( 'open-block' )
			) {
				toggle( $sectionHeading );
			}
		} );
	}

	/*
	 * Clean obsolete (saved more than a day ago) expanded sections from
	 * localStorage.
	 */
	function cleanObsoleteStoredSections() {
		var now = ( new Date() ).getTime(),
			expandedSections = getExpandedSections(),
			// the number of days between now and the time a setting was saved
			daysDifference;
		$.each( expandedSections, function ( page, sections ) {
			// clean the setting if it is more than a day old
			$.each( sections, function ( section, timestamp ) {
				daysDifference = Math.floor( ( now - timestamp ) / 1000 / 60 / 60 / 24 );
				if ( daysDifference >= 1 ) {
					delete expandedSections[page][section];
				}
			} );
		} );
		saveExpandedSections( expandedSections );
	}

	/*
	 * Given a heading, toggle it and any of its children
	 *
	 * @param {jQuery.Object} $heading A heading belonging to a section
	 */
	function toggle( $heading ) {
		var isCollapsed = $heading.is( '.open-block' );

		$heading.toggleClass( 'open-block' );
		if ( $heading.hasClass( 'open-block' ) ) {
			$heading.addClass( classOpen ).removeClass( classClosed );
		} else {
			$heading.removeClass( classOpen ).addClass( classClosed );
		}
		$heading.next()
			.toggleClass( 'open-block' )
			.attr( {
				'aria-pressed': !isCollapsed,
				'aria-expanded': !isCollapsed
			} );

		if ( M.isBetaGroupMember() && !M.isWideScreen() ) {
			storeSectionToggleState( $heading );
		}
	}

	/*
	 * Enables toggling via enter and space keys
	 *
	 * @param {jQuery.Object} $heading
	 */
	function enableKeyboardActions( $heading ) {
		$heading.on( 'keypress', function ( ev ) {
			if ( ev.which === 13 || ev.which === 32 ) {
				// Only handle keypresses on the "Enter" or "Space" keys
				toggle( $( this ) );
			}
		} ).find( 'a' ).on( 'keypress mouseup', function ( ev ) {
			ev.stopPropagation();
		} );
	}

	/*
	 * Reveals an element and its parent section as identified by it's id
	 *
	 * @param {String} selector A css selector that identifies a single element
	 * @param {Object} $container jQuery element to search in
	 */
	function reveal( selector, $container ) {
		var $target, $heading;

		// jQuery will throw for hashes containing certain characters which can break toggling
		try {
			$target = $container.find( M.escapeHash( selector ) );
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

	function enable( $container ) {
		var tagName, $headings, expandSections,
			$firstHeading,
			iconClass = iconDown.getClassName(),
			collapseSectionsByDefault = mw.config.get( 'wgMFCollapseSectionsByDefault' );
		$container = $container || $( '#content' );

		$( 'html' ).removeClass( 'stub' );
		$firstHeading = $container.find( 'h1,h2,h3,h4,h5,h6' ).eq( 0 );
		tagName = $firstHeading.prop( 'tagName' ) || 'H1';
		$container.find( tagName ).addClass( 'collapsible-heading ' + iconClass );

		$headings = $container.find( '.collapsible-heading' );
		$headings.next( 'div' ).addClass( 'collapsible-block' );

		if ( collapseSectionsByDefault === undefined ) {
			// Old default behavior if on cached output
			collapseSectionsByDefault = true;
		}
		expandSections = !collapseSectionsByDefault ||
			( M.isAlphaGroupMember() && M.settings.getUserSetting( 'expandSections', true ) === 'true' );

		$headings.each( function ( i ) {
			var $elem = $( this ),
				id = 'collapsible-block-' + i;

			$elem.next( '.collapsible-block' ).eq( 0 )
				.attr( {
					// We need to give each content block a unique id as that's
					// the only way we can tell screen readers what element we're
					// referring to (aria-controls)
					id: id,
					'aria-pressed': 'false',
					'aria-expanded': 'false'
				} );

			$elem.attr( {
				tabindex: 0,
				'aria-haspopup': 'true',
				'aria-controls': id
			} )
			.on( 'click', function ( ev ) {
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
				reveal( hash, $container );
			} else if ( internalRedirectHash ) {
				window.location.hash = internalRedirectHash;
				reveal( internalRedirectHash, $container );
			}
		}
		checkHash();
		$( '#content_wrapper a' ).on( 'click', checkHash );

		if ( M.isBetaGroupMember() && !M.isWideScreen() ) {
			expandStoredSections( $container );
			cleanObsoleteStoredSections();
		}
	}

	function init( $container ) {
		// distinguish headings in content from other headings
		$( '#content' ).find( '> h1,> h2,> h3,> h4,> h5,> h6' ).addClass( 'section-heading' );
		enable( $container );
	}

	// avoid this running on Watchlist
	if (
		!M.inNamespace( 'special' ) &&
		!mw.config.get( 'wgIsMainPage' ) &&
		mw.config.get( 'wgAction' ) === 'view'
	) {
		if ( mw.config.get( 'wgMFPageSections' ) ) {
			init();
		}
	}

	M.define( 'toggle', {
		reveal: reveal,
		toggle: toggle,
		enable: init,
		// for tests
		_currentPageTitle: currentPageTitle,
		_getExpandedSections: getExpandedSections,
		_expandStoredSections: expandStoredSections,
		_cleanObsoleteStoredSections: cleanObsoleteStoredSections
	} );

}( mw.mobileFrontend, jQuery ) );
