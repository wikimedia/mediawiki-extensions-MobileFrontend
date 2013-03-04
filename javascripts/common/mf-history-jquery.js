( function( M, $ ) {

	var
		firstRun,
		makeStubPage,
		updateQueryStringParameter = M.history.updateQueryStringParameter,
		getArticleUrl = M.history.getArticleUrl,
		currentTitle = mw.config.get( 'wgTitle', '' ),
		navigateToPage,
		loadPage,
		loadLanguages,
		apiUrl = M.getApiUrl(),
		api = M.require( 'api' ),
		languageCache;

	function updateUILinks( title ) {
		// FIXME: make this more generic
		title = M.prettyEncodeTitle( title );
		$( '#mw-mf-menu-main a' ).each( function() {
			var href = $( this ).attr( 'href' );
			if ( href.indexOf( 'returnto=' ) > -1 && !$( this ).hasClass( 'noHijack' ) ) {
				$( this ).attr( 'href', updateQueryStringParameter( href, 'returnto', title ) );
			}
		} );
		$( '#content_footer .notice a' ).each( function() {
			var href = $( this ).attr( 'href' );
			if ( href.indexOf( 'action=history' ) > -1 ) {
				$( this ).attr( 'href', updateQueryStringParameter( href, 'title', title ) );
			}
		} );
	}

	function gatherLanguages() {
		if ( !languageCache ) {
			languageCache = api.get( {
				action: 'query',
				meta: 'siteinfo',
				siprop: 'languages',
				format: 'json'
			} ).then( function( data ) {
				var languages = {};
				data.query.languages.forEach( function( item ) {
					languages[ item.code ] = item[ '*' ];
				} );
				return languages;
			} );
		}
		return languageCache;
	}

	function hijackLinks( container ) {
		container = container || document.getElementById( 'content' );
		$( container ).find( 'a' ).on( 'click', function( ev ) {
			var title = $( this ).attr( 'title' ),
				namespaced = title && title.indexOf( ':' ) > -1,
				canHijack = !$( this ).is( '.new,.external,.image' );
			if ( canHijack && title && !namespaced ) {
				navigateToPage( title );
				ev.preventDefault();
			}
		} );
	}

	function renderLanguages( langlinks ) {
		gatherLanguages().done( function( languages ) {
			langlinks.forEach( function( item, i ) {
				langlinks[ i ].langname = languages[ item.lang ];
			} );
			var template = M.template.get( 'languageSection' ),
				data = {
					langlinks: langlinks,
					heading: mw.msg( 'mobile-frontend-language-article-heading' ),
					description: mw.msg( 'mobile-frontend-language-header', langlinks.length )
				},
				html = template.render( data );

			$( html ).insertAfter( $( '.section' ).last() );
			M.emit( 'languages-loaded' );
		} );
	}

	// FIXME: use template engine this is not maintainable
	function renderPage( pageTitle, resp, constructPage ) {
		var i, secs, s, sectionNum = 0, level, text,
			$content = $( '#content' ),
			$section,
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
			updateUILinks( pageTitle );

			if ( resp.mobileview.hasOwnProperty( 'mainpage' ) ) {
				M.emit( 'homepage-loaded' );
			}
			M.triggerPageReadyHook( pageTitle, sectionData, anchorSection );
			$( '#content_0' ).removeClass( 'loading' ); // reset loader
		}
	}

	loadLanguages = function( title ) {
		$( '#mw-mf-language-section' ).remove();
		$.ajax( {
			url: apiUrl,
			dataType: 'json',
			data: {
				action: 'query',
				prop: 'langlinks',
				format: 'json',
				llurl: true,
				lllimit: 'max',
				titles: title
			}
		} ).done( function( resp ) {
			var pages = M.getPageArrayFromApiResponse( resp ),
				// FIXME: "|| []" wouldn't be needed if API was more consistent
				langlinks = pages[0] ? pages[0].langlinks || [] : [];

			renderLanguages( langlinks );
		} );
	};

	makeStubPage = function( title, summary ) {
		var $content = $( '#content' );
		$content.empty();
		$( '<h1 id="section_0">' ).text( title ).appendTo( $content );
		$( '<div id="content_0" class="content_block openSection loading">' ).
			text( summary ).appendTo( $content );
		return $content;
	};

	loadPage = function( pageTitle, constructPage ) {
		currentTitle = pageTitle;
		if ( constructPage ) {
			makeStubPage( pageTitle, M.message( 'mobile-frontend-ajax-page-loading', pageTitle ) );
		}
		return $.ajax( {
			url: apiUrl, dataType: 'json',
			data: {
				action: 'mobileview', format: 'json',
				page: pageTitle,
				variant: mw.config.get( 'wgPreferredVariant' ),
				redirects: 'yes', prop: 'sections|text', noheadings: 'yes',
				noimages: mw.config.get( 'wgImagesDisabled', false ) ? 1 : undefined,
				sectionprop: 'level|line|anchor', sections: 'all'
			}
		} ).done( function( resp ) {
			if ( resp.error ) {
				if ( resp.error.code !== 'missingtitle'  ) {
					window.location.href = getArticleUrl( pageTitle );
				}
			} else {
				renderPage( pageTitle, resp, constructPage );
				loadLanguages( pageTitle );
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

	M.on( 'page-loaded', function() {
		hijackLinks();
	} );

	if ( M.history.isDynamicPageLoadEnabled ) {
		navigateToPage = function( title, constructPage ) {
			var page;
			mw.config.set( 'wgTitle', title );
			mw.config.set( 'wgArticleId', -1 ); // FIXME: no longer valid
			document.title = mw.message( 'pagetitle', title ).parse();
			page = loadPage( title, typeof constructPage === 'undefined' ? true : constructPage );
			window.history.pushState( { title: title, hash: true }, title, getArticleUrl( title ) );
			return page;
		};
		// deal with initial pop so that we can record the initial page
		window.history.replaceState( { title: currentTitle, hash: true }, currentTitle );

		$( window ).bind( 'popstate', function( ev ) {
			var state = ev.originalEvent.state;
			if ( !firstRun ) {
				firstRun = true;
			} else if ( state ) {
				loadPage( state.title, true );
				if ( state.hash ) {
					M.emit( 'history-change', { hash: window.location.hash } );
				}
			}
		} );
	}

	M.history.makeStubPage = makeStubPage;
	M.history.hijackLinks = hijackLinks;
	M.history.loadPage = loadPage;
	M.history.navigateToPage = navigateToPage;

} ( mw.mobileFrontend, jQuery ) );
