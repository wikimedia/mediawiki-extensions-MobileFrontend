( function( M, $ ) {
var references = ( function() {
		var
			popup = M.require( 'notifications' );

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
			if ( M.history.isDynamicPageLoadEnabled ) {
				M.on( 'page-loaded', function() {
					setupReferences( $( '#content' )[ 0 ] );
				} ).on( 'section-rendered', setupReferences );
			} else {
				setupReferences.apply( this, arguments );
			}
		}
		return {
			init: init,
			setupReferences: setupReferences
		};
	}() );

	M.define( 'references', references );

}( mw.mobileFrontend, jQuery ) );
