if( typeof jQuery !== 'undefined' ) {
	MobileFrontend.references = (function($) {
		function collect() {
			var references = {};
			$( 'ol.references li' ).each(function(i, el) {
				references[ $(el).attr( 'id' ) ] = {
					html: $(el).html(),
					label: i + 1
				};
			});
			return references;
		}

		// TODO: only apply to places that need it
		// http://www.quirksmode.org/blog/archives/2010/12/the_fifth_posit.html
		// https://github.com/Modernizr/Modernizr/issues/167
		$( document ).scroll( function(ev) {
			$( '#mf-references' ).css( {
				bottom: -window.pageYOffset,
				position: 'absolute'
			} );
		} );

		function init() {
			$( '<div id="mf-references"><div></div></div>' ).hide().appendTo( document.body );
			var close = function( ev ) {
				$( '#mf-references' ).slideUp();
			};
			$( '<button>close</button>' ).click( close ).appendTo( '#mf-references' );
			$( '.mw-cite-backlink a' ).click( close );
			
			var data, html, href, references = collect();
			$( 'sup a' ).click( function(ev) {
				href = $(this).attr( 'href' );
				data = href && href.charAt(0) === '#' ?
					references[ href.substr( 1, href.length ) ] : null;

				if( data ) {
					html = '<h3>[' + data.label + ']</h3>' + data.html;
				} else {
					html = $( '<a />' ).text( $(this).text() ).
						attr( 'href', href ).appendTo('<div />').parent().html();
				}
				$( '#mf-references div' ).html( html );
				$( '#mf-references' ).slideDown( 1000 );
				ev.preventDefault();
			});
		}
		init();
	})(jQuery);
}