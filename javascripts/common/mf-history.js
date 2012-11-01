/*global mw, document, window, _mwStart */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true, nomen: true */
( function( M ) {

M.history = ( function() {
	var initialised = false,
		firstRun,
		loadPage = function() {},
		$ = M.jQuery,
		inBeta = M.setting( 'beta' ),
		currentTitle = M.setting( 'title' ),
		apiUrl = M.setting( 'scriptPath' ) + '/api.php',
		URL_TEMPLATE = mw.mobileFrontend.setting( 'pageUrl' ),
		navigateToPage = function( title ) {
			window.location.href = URL_TEMPLATE.replace( '$1', title );
		};

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

		function makeStubPage( title, summary ) {
			var $content = $( '#content' );
			$content.empty();
			$( '<h1 id="section_0" class="section_heading openSection">' ).text( title ).appendTo( $content );
			$( '<div id="content_0" class="content_block openSection loading">' ).
				text( summary ).appendTo( $content );
			return $content;
		}

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
					sectionprop: 'level|line', sections: 'all' }
				} ).done( function( resp ) {
					var i, secs, s, sectionNum = 0, level, text,
						$tmpContainer = $( '<div>' ),
						sectionData = {};
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
								if ( constructPage ) {
									$section = $( '<div class="section">' ).appendTo( $content );
									// TODO: link these so they are clickable
									$( '<h2 class="section_heading">' ).attr( 'id', 'section_' + sectionNum ).
										data( 'section', sectionNum ).
										text( s.line ).appendTo( $section );
								}
							} else if ( level ) {
								$tmpContainer.html( text );
								$tmpContainer.prepend( $( '<h' + level + '>' ).text( s.line ) );
								sectionData[ sectionNum ].html += $tmpContainer.html();
							}
							if( s.hasOwnProperty( 'references' ) ) {
								sectionData[ sectionNum ].references = true;
								$( '<div class="content_block">' ).attr( 'id', 'content_' + sectionNum ).
									html( sectionData[ sectionNum ].html ).insertAfter( '#section_' + sectionNum );
							}
						}
						$( window ).trigger( 'mw-mf-page-loaded', [ { title: pageTitle, data: sectionData } ] );
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
		$( window ).bind( 'mw-mf-page-loaded', function( ev ) {
			hijackLinks();
		} );

		if ( window.history && window.history.pushState && inBeta ) {
			navigateToPage = function( title ) {
				var page;
				_mwStart = +new Date; // reset logger
				page = loadPage( title, true );
				window.history.pushState( { title: title }, title, URL_TEMPLATE.replace( '$1', title ) + window.location.search );
				return page;
			};
			// deal with initial pop so that we can record the initial page
			window.history.replaceState( { title: currentTitle }, currentTitle,
					URL_TEMPLATE.replace( '$1', currentTitle ) + window.location.search );

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
		if ( !initialised && hash !== '#_' && typeof $ !== 'undefined' ) {
			initialised = true;
			$( window ).bind( 'mw-mf-ready', function() {
				$( window ).trigger( 'mw-mf-history-change', [ { hash: hash } ] );
			} );
		}
	}

	return {
		hijackLinks: hijackLinks,
		loadPage: loadPage,
		makeStubPage: makeStubPage,
		navigateToPage: navigateToPage,
		replaceHash: function( newHash ) {
			var hashChanged = newHash !== window.location.hash;
			if ( window.history && window.history.replaceState && hashChanged ) {
				window.history.replaceState( { title: currentTitle, hash: true }, currentTitle, newHash );
			} else if ( hashChanged ){
				window.location.hash = newHash;
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
