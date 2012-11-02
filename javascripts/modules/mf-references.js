/*global document, window, mw, jQuery, navigator */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M, $ ) {
var references = ( function() {
		var inBeta = M.setting( 'beta' ),
			popup = M.navigation.popup;

		function collect() {
			var references = {};
			$( 'ol.references li' ).each( function() {
				references[ $( this ).attr( 'id' ) ] = {
					html: $( this ).html()
				};
			} );
			return references;
		}

		/*
		init
			options:
				onClickReference: <function>
					Define a handler that is run upon clicking a reference
		*/
		function setupReferences( container, options ) {
			var lastLink, data, html, href, references = collect();
			container = container || $( '#content' )[ 0 ];
			function cancelBubble( ev ) {
				ev.stopPropagation();
			}

			function close() {
				lastLink = null;
				popup.close();
			}
			$( '.mw-cite-backlink a' ).click( close );

			function clickReference( ev ) {
				var $popup;

				href = $( this ).attr( 'href' );
				data = href && href.charAt( 0 ) === '#' ?
					references[ href.substr( 1, href.length ) ] : null;

				if ( !popup.isVisible() || lastLink !== href ) {
					lastLink = href;
					if ( data ) {
						html = '<h3>' + $( this ).text() + '</h3>' + data.html;
					} else {
						html = $( '<a />' ).text( $(this).text() ).
							attr( 'href', href ).appendTo( '<div />' ).parent().html();
					}
					$popup = popup.show( html );
					$popup.find( 'div sup a' ).click( clickReference );
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
					this.ontouchstart = cancelBubble;
				} );
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
