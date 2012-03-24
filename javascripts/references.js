if( typeof jQuery !== 'undefined' ) {
	MobileFrontend.references = (function($) {
		var calculatePosition = function() {}, hashtest, options = {}, wasVisible;

		hashtest = window.location.hash.substr(1).match(/refspeed:([0-9]*)/);
		options.animationSpeed = hashtest ? parseInt( hashtest[1], 10 ) : 500;
		hashtest = window.location.hash.substr(1).match(/refanimation:([a-z]*)/);
		options.animation = hashtest ? hashtest[1] : null;

		function collect() {
			var references = {};
			$( 'ol.references li' ).each(function(i, el) {
				references[ $(el).attr( 'id' ) ] = {
					html: $(el).html()
				};
			});
			return references;
		}

		// TODO: only apply to places that need it
		// http://www.quirksmode.org/blog/archives/2010/12/the_fifth_posit.html
		// https://github.com/Modernizr/Modernizr/issues/167
		function supportsPositionFixed() {
			// TODO: don't use device detection
			var agent = navigator.userAgent;
			// match anything over Webkit 534
			return agent.match( /AppleWebKit\/(53[4-9]|5[4-9]\d?|[6-9])\d?\d?/ ) ? true : false;
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
			$( document ).scroll(calculatePosition);
			document.body.ontouchstart = function() {
				wasVisible = $( '#mf-references' ).is( ':visible' );
				$( '#mf-references' ).hide();
			};
			document.body.ontouchend = function() {
				if( wasVisible ) {
					$( '#mf-references' ).show();
				}
			};
		}

		function init() {
			var el = $( '<div id="mf-references"><div></div></div>' ).hide().appendTo( document.body )[0];
			function cancelBubble( ev ) {
				ev.stopPropagation();
			}
			el.ontouchstart = cancelBubble;
			var close = function() {
				var top;
				lastLink = null;
				if( options.animation === 'none' ) {
					$( '#mf-references' ).hide();
				} else if( options.animation === 'slide' ){
					top = window.innerHeight + window.pageYOffset;
					$( '#mf-references' ).show().animate( { top: top }, options.animationSpeed );
				} else {
					$( '#mf-references' ).fadeOut( options.animationSpeed );
				}
			}, lastLink, data, html, href, references = collect();
			$( '<button>close</button>' ).click( close ).appendTo( '#mf-references' );
			$( '.mw-cite-backlink a' ).click( close );

			function clickReference(ev) {
				var top, oh;
				href = $(this).attr( 'href' );
				data = href && href.charAt(0) === '#' ?
					references[ href.substr( 1, href.length ) ] : null;

				if( !$("#mf-references").is(":visible") || lastLink !== href) {
					lastLink = href;
					if( data ) {
						html = '<h3>' + $(this).text() + '</h3>' + data.html;
					} else {
						html = $( '<a />' ).text( $(this).text() ).
							attr( 'href', href ).appendTo('<div />').parent().html();
					}
					$( '#mf-references div' ).html( html );
					$('#mf-references div sup a').click( clickReference );
					calculatePosition();
					if( options.animation === 'none' ) {
						$( '#mf-references' ).show();
					} else if( options.animation === 'slide' ){
						top = window.innerHeight + window.pageYOffset;
						oh = $( '#mf-references' ).outerHeight();
						$( '#mf-references' ).show().css( { 'top': top } ).
							animate( { top: top - oh }, options.animationSpeed );
					} else {
						$( '#mf-references' ).fadeIn( options.animationSpeed );
					}
				} else {
					close();
				}
				ev.preventDefault();
			}
			$( 'sup a' ).unbind('click').click( clickReference ).each(function(i, el) {
				el.ontouchstart = cancelBubble;
			});
		}
		init();
	}(jQuery));
}
