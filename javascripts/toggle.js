/*global mw, document, window, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
(function( MobileFrontend ) {
MobileFrontend.toggle = (function( $ ) {
	var u = MobileFrontend.utils,
		M = MobileFrontend,
		inBeta = u( document.body ).hasClass( 'beta' ),
		message = MobileFrontend.message,
		showLabel = message( 'expand-section' ),
		hideLabel = message( 'collapse-section' );

	function wm_toggle_section( section_id ) {
		var b = document.getElementById( 'section_' + section_id ), id,
			hash, d,
			html = '',
			bb = b.getElementsByTagName( 'button' )[0], i, s, e, closed, reset = [];
		if( u( b ).hasClass( 'openSection' ) ) {
			u( b ).removeClass( 'openSection' );
			u( bb ).removeClass( 'openSection' );
			u( bb ).text( showLabel );
			closed = true;
		} else {
			reset.push( b );
			u( b ).addClass( 'openSection' );
			u( bb ).addClass( 'openSection' );
			u( bb ).text( hideLabel );
		}
		for ( i = 0, d = ['content_','anchor_']; i<=1; i++ ) {
			e = document.getElementById( d[i] + section_id );
			if ( e && u( e ).hasClass( 'openSection' ) ) {
				u( e ).removeClass( 'openSection' );
			} else if( e ) {
				reset.push( e );
				u( e ).addClass( 'openSection' );
			}
		}
		// NOTE: # means top of page so using a dummy hash #_ to prevent page jump
		id = 'section_' + section_id;
		e = document.getElementById( id );
		e.removeAttribute( 'id' );
		hash = closed ? '#_' : '#' + id;
		MobileFrontend.history.replaceHash( hash );
		e.setAttribute( 'id', id );

		if( M.jQuery && inBeta ) {
			if( $( b ).data( 'section' ) ) {
				$( '#content_' + section_id ).html( $( b ).data( 'section' ) );
				mw.mobileFrontend.references.init();
				$( b ).data( 'section', false );
			}
		}
	}

	function wm_reveal_for_hash( hash ) {
		var targetel = document.getElementById( hash.substr(1) ),
			p, section_idx;
		if ( targetel ) {
			p = targetel;
			while ( p && !u(p).hasClass( 'content_block' ) &&
				!u(p).hasClass( 'section_heading' ) ) {
				p = p.parentNode;
			}
			if ( p && ! u( p ).hasClass( 'openSection' ) ) {
				section_idx = p.id.split( '_' )[1];
				wm_toggle_section( section_idx );
			}
		}
	}

	function init() {
		var i, a, heading, h2, btns = [], buttons,
			apiUrl = M.setting( 'scriptPath' ) + '/api.php',
			sections = [],
			sectionHeadings = [], content;

		content = document.getElementById( 'content_wrapper' );
		h2 = document.getElementsByTagName( 'H2' );

		for( i = 0; i < h2.length; i++) {
			heading = h2[i];
			if( u( heading ).hasClass( 'section_heading') ) {
				sectionHeadings.push( heading );
			}
		}

		function openSectionHandler( ev ) {
			var sectionName = this.id ? this.id.split( '_' )[1] : -1;
			if( ev && ev.preventDefault ) {
				ev.preventDefault();
			}
			if( sectionName !== -1 ) {
				wm_toggle_section( sectionName );
			}
		}
		function createButton() {
			var btn = document.createElement( 'button' );
			u( btn ).text( showLabel );
			return btn;
		}

		function enableToggling( sectionsHtml ) {
			var id, sec;
			u( document.documentElement ).addClass( 'togglingEnabled' );
			for( i = 0; i < sectionHeadings.length; i++ ) {
				heading = sectionHeadings[i];
				id = heading.id.split( '_' )[ 1 ]
				heading.insertBefore( createButton(), heading.firstChild );
				a = document.getElementById( 'anchor_' + id );
				sec = sectionsHtml[ i ];
				if( inBeta && sectionsHtml && sec ) {
					if( sec.references ) {
						$( '#content_' + id ).html( sec.html );
						mw.mobileFrontend.references.init();
					} else {
						$( heading ).data( 'section',  sec.html );
					}
				}
				if( a && inBeta ) {
					u( a ).text( message( 'mobile-frontend-close-section' ) );
					u( a ).bind( 'click', openSectionHandler );
				}
				u( heading ).bind( 'click', openSectionHandler );
			}
		}
		
		function checkHash() {
			var hash = window.location.hash;
			if ( hash.indexOf( '#' ) === 0 ) {
				wm_reveal_for_hash( hash );
			}
			if( hash ) {
				MobileFrontend.history.replaceHash( '#_' ); // clear existing hash for case of jump to top
				MobileFrontend.history.replaceHash( hash );
			}
		}

		sections = [];
		$( 'h2' ).each( function( i, el ) {
			sections.push( i + 1 );
		} );
		if( inBeta && MobileFrontend.jQuery ) {
			var data = {
				action: 'mobileview',
				page: $( 'h1' ).text(),
				redirects: 'yes',
				prop: 'sections|text',
				noheadings: 'yes',
				sectionprop: 'level|line',
				format: 'json',
				sections: sections.join('|')
			};
			$.ajax({
				url: apiUrl,
				data: data,
				dataType: 'json',
				success: function( resp ) {
					if( resp && resp.mobileview && resp.mobileview.sections ) {
						var i, secs = resp.mobileview.sections, s,
							html = [], sectionNum = -1, level;
						for( i = 0; i < secs.length; i++ ) {
							s = secs[ i ];
							level = s.level;
							if( level === '2' ) {
								sectionNum += 1;
								html[ sectionNum ] = { html: s.text };
							} else if( level ) {
								html[ sectionNum ].html += $( '<h' + level + '>' ).text( s.line ).html() + s.text;
							}
							if( s.hasOwnProperty( 'references' ) ) {
								html[ sectionNum ].references = true;
							}
						}
						enableToggling( html );
						checkHash();
					}
				},
				error: function() {
					u( document.documentElement ).addClass( 'togglingEnabled' );
				}
			});
		} else {
			enableToggling();
			checkHash();
		}

		for ( a = content.getElementsByTagName( 'a' ), i = 0; i < a.length; i++ ) {
			u( a[i] ).bind( 'click', checkHash );
		}
	}

	MobileFrontend.registerModule( 'toggle' );
	return {
		wm_reveal_for_hash: wm_reveal_for_hash,
		wm_toggle_section: wm_toggle_section,
		init: init
	};

}( jQuery ));
}( mw.mobileFrontend ));
