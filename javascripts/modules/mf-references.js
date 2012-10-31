/*global document, window, mw, jQuery, navigator */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M, $ ) {
var references = ( function() {
		var calculatePosition = function() {},
			inBeta = M.setting( 'beta' ),
			supportsPositionFixed = M.supportsPositionFixed;

		function collect() {
			var references = {};
			$( 'ol.references li' ).each( function() {
				references[ $( this ).attr( 'id' ) ] = {
					html: $( this ).html()
				};
			} );
			return references;
		}

		if( !supportsPositionFixed() ) {
			calculatePosition = function() {
				var h = $( '#mf-references' ).outerHeight();
				$( '#mf-references' ).css( {
					top:  ( window.innerHeight + window.pageYOffset ) - h,
					bottom: 'auto',
					position: 'absolute'
				} );
			};
			$( document ).scroll( calculatePosition );
		}

		function getReferenceTop() {
			// http://bugs.jquery.com/ticket/6724
			var winHeight = window.innerHeight || $( window ).height();
			return winHeight + $( window ).scrollTop();
		}

		/*
		init
			options:
				onClickReference: <function>
					Define a handler that is run upon clicking a reference
		*/
		function setupReferences( container, firstRun, options ) {
			var el, close, lastLink, data, html, href, references = collect();
			container = container || $( '#content' )[ 0 ];
			firstRun = firstRun === undefined ? true : firstRun;
			$( '#mf-references' ).remove();
			el = $( '<div id="mf-references"><div></div></div>' ).hide().
				appendTo( document.body )[ 0 ];
			function cancelBubble( ev ) {
				ev.stopPropagation();
			}
			el.ontouchstart = cancelBubble;
			close = function() {
				if ( !$( '#mf-references' ).is( ':visible' ) ) {
					return;
				}
				var top;
				lastLink = null;
				$( '#mf-references' ).hide();
			};
			$( '<button>close</button>' ).click( close ).appendTo( '#mf-references' );
			$( '.mw-cite-backlink a' ).click( close );

			function clickReference( ev ) {
				var top, oh;
				href = $( this ).attr( 'href' );
				data = href && href.charAt( 0 ) === '#' ?
					references[ href.substr( 1, href.length ) ] : null;

				if ( !$( '#mf-references' ).is( ':visible' ) || lastLink !== href ) {
					lastLink = href;
					if ( data ) {
						html = '<h3>' + $( this ).text() + '</h3>' + data.html;
					} else {
						html = $( '<a />' ).text( $(this).text() ).
							attr( 'href', href ).appendTo( '<div />' ).parent().html();
					}
					$( '#mf-references div' ).html( html );
					$( '#mf-references div sup a' ).click( clickReference );
					calculatePosition();
					$( '#mf-references' ).show();
				} else {
					close();
				}
				if ( options && options.onClickReference ) {
					options.onClickReference( ev );
				}
				ev.preventDefault();
				cancelBubble( ev );
			}
			$( 'sup a', container ).unbind( 'click' ).
				click( clickReference ).each( function() {
					el.ontouchstart = cancelBubble;
				} );
			if ( firstRun ) {
				$( window ).scroll( function() {
					close();
				} );
				$( document.body ).bind( 'click', close ).bind( 'touchstart', function() {
					$( '#mf-references' ).hide();
				} );
			}
		}

		function init() {
			if ( inBeta ) {
				$( window ).on( 'mw-mf-page-loaded', function() {
					setupReferences( $( '#content' )[ 0 ] );
				} ).on( 'mw-mf-section-rendered', function( ev, container ) {
					setupReferences( container );
				} );
			} else {
				setupReferences.apply( this, arguments );
			}
		}
		return {
			init: init,
			setupReferences: setupReferences
		};
	}() );

	M.registerModule( 'references', references );

}( mw.mobileFrontend, jQuery ) );
