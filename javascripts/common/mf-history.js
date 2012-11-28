( function( M ) {

M.history = ( function() {
	var initialised = false,
		firstRun,
		makeStubPage,
		loadPage,
		$ = M.jQuery,
		inBeta = M.getConfig( 'beta', false ),
		currentTitle = M.getConfig( 'title', '' ),
		apiUrl = M.getConfig( 'scriptPath', '' ) + '/api.php',
		URL_TEMPLATE = M.getConfig( 'pageUrl', '' ),
		navigateToPage = function( title ) {
			window.location.href = URL_TEMPLATE.replace( '$1', title );
		};

	function getArticleUrl( title ) {
		title = title.replace( / /gi, '_' );
		return URL_TEMPLATE.replace( '$1', title ) + window.location.search;
	}

	function hijackLinks( container ) {
		container = container || document.getElementById( 'content' );
		$( container ).find( 'a' ).on( 'click', function( ev ) {
			var title = $( this ).attr( 'title' ),
				namespaced = title && title.indexOf( ':' ) > -1,
				nofollow = $( this ).hasClass( 'new,external' );
			if ( !nofollow && title && !namespaced ) {
				navigateToPage( title );
				ev.preventDefault();
			}
		} );
	}
	if ( $ ) {

		makeStubPage = function( title, summary ) {
			var $content = $( '#content' );
			$content.empty();
			$( '<h1 id="section_0" class="section_heading openSection">' ).text( title ).appendTo( $content );
			$( '<div id="content_0" class="content_block openSection loading">' ).
				text( summary ).appendTo( $content );
			return $content;
		};

		loadPage = function( pageTitle, constructPage ) {
			var $content = $( '#content' ), $section;
			currentTitle = pageTitle;
			if ( constructPage ) {
				makeStubPage( pageTitle, M.message( 'mobile-frontend-ajax-page-loading', pageTitle ) );
			}
			return $.ajax( {
				url: apiUrl, dataType: 'json',
				data: {
					action: 'mobileview', format: 'json',
					page: pageTitle,
					redirects: 'yes', prop: 'sections|text', noheadings: 'yes',
					noimages: mw.mobileFrontend.setting( 'imagesDisabled' ) ? 1 : undefined,
					sectionprop: 'level|line|anchor', sections: 'all' }
				} ).done( function( resp ) {
					var i, secs, s, sectionNum = 0, level, text,
						$tmpContainer = $( '<div>' ),
						sectionData = {},
						anchorSection = {};
					if ( resp && resp.mobileview && resp.mobileview.sections ) {
						secs = resp.mobileview.sections;
						for( i = 0; i < secs.length; i++ ) {
							s = secs[ i ];
							level = s.level;
							text = s.text || '';
							if ( constructPage && i === 0 ) { // do lead
								$( '#content_0' ).html( text );
							}
							if ( level === '2' ) {
								sectionNum = sectionNum + 1;
								sectionData[ sectionNum ] = { html: text };
								// add self as a parent so that we unfold it when needed
								anchorSection[ s.anchor ] = sectionNum;
								anchorSection[ 'section_' + sectionNum ] = sectionNum;
								if ( constructPage ) {
									$section = $( '<div class="section">' ).appendTo( $content );
									// TODO: link these so they are clickable
									$( '<h2 class="section_heading">' ).attr( 'id', 'section_' + sectionNum ).
										html( s.line ).appendTo( $section );
								}
							} else if ( level ) {
								$tmpContainer.html( text );
								$tmpContainer.prepend( $( '<h' + level + '>' ).attr( 'id', s.anchor ).html( s.line ) );
								sectionData[ sectionNum ].html += $tmpContainer.html();
								// we need to know the parent of subsection to unfold the proper section
								anchorSection[ s.anchor ] = sectionNum;
							}
							if( s.hasOwnProperty( 'references' ) ) {
								sectionData[ sectionNum ].references = true;
								$( '<div class="content_block">' ).attr( 'id', 'content_' + sectionNum ).
									html( sectionData[ sectionNum ].html ).insertAfter( '#section_' + sectionNum );
							}
						}
						$( window ).trigger( 'mw-mf-page-loaded', [ {
							title: pageTitle, data: sectionData, anchorSection: anchorSection
						} ] );
						$( '#content_0' ).removeClass( 'loading' ); // reset loader
					}
				} ).fail( function() { // resort to non-javascript mode
					$( 'html' ).addClass( 'togglingEnabled' );
					if ( constructPage ) { // when not constructing page there will be links to fall back to
						$( '#content_0' ).removeClass( 'loading' ).
							text( M.message( 'mobile-frontend-ajax-page-error', pageTitle ) ).
							addClass( 'ajaxError' ); // reset loader
						$( '<button>' ).text( M.message( 'mobile-frontend-ajax-random-retry' ) ).click( function() {
							loadPage( pageTitle, constructPage );
						} ).appendTo( '#content_0' );
					}
				} );
		};
		$( window ).bind( 'mw-mf-page-loaded', function() {
			hijackLinks();
		} );

		if ( window.history && window.history.pushState && inBeta ) {
			navigateToPage = function( title ) {
				var page;
				_mwStart = +new Date; // reset logger
				M.setConfig( 'title', title );
				page = loadPage( title, true );
				window.history.pushState( { title: title }, title, getArticleUrl( title ) );
				return page;
			};
			// deal with initial pop so that we can record the initial page
			window.history.replaceState( { title: currentTitle }, currentTitle );

			$( window ).bind( 'popstate', function( ev ) {
				var state = ev.originalEvent.state;
				if ( !firstRun ) {
					firstRun = true;
				} else if ( state ) {
					loadPage( state.title, true );
					if ( state.hash ) {
						$( window ).trigger( 'mw-mf-history-change',
							[ { hash: window.location.hash } ] );
					}
				}
			} );
		}
	}

	// ensures the history change event fires on initial load
	function initialise( hash ) {
		if ( !initialised && hash !== '#_' && $ ) {
			initialised = true;
			$( window ).bind( 'mw-mf-ready', function() {
				$( window ).trigger( 'mw-mf-history-change', [ { hash: hash } ] );
			} );
		}
	}

	return {
		hijackLinks: hijackLinks,
		getArticleUrl: getArticleUrl,
		loadPage: loadPage,
		makeStubPage: makeStubPage,
		navigateToPage: navigateToPage,
		replaceHash: function( newHash ) {
			var hashChanged = newHash !== window.location.hash,
				id = newHash.slice( 1 ),
				hashNode = document.getElementById( id );
			if ( window.history && window.history.replaceState && hashChanged ) {
				window.history.replaceState( { title: currentTitle, hash: true }, currentTitle, newHash );
			} else if ( hashChanged && hashNode ){
				hashNode.removeAttribute( 'id' );
				window.location.hash = newHash;
				hashNode.setAttribute( 'id', id );
			}
			initialise( newHash );
		},
		pushState: function( hash ) {
			var hashChanged = hash !== window.location.hash;
			if ( window.history && window.history.pushState && hashChanged ) {
				window.history.pushState( { title: currentTitle, hash: true }, currentTitle, hash );
			} else if ( hashChanged ) {
				window.location.hash = hash;
			}
			initialise( hash );
		}
	};
}() );

} ( mw.mobileFrontend ) );
