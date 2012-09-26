/*global document, window, mw, jQuery, navigator */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M ) {
var MobileFrontend = M, references;
if( typeof jQuery !== 'undefined' ) {
	references = ( function( $ ) {
		var calculatePosition = function() {}, wasVisible,
			supportsPositionFixed = MobileFrontend.supportsPositionFixed;

		function collect() {
			var references = {};
			$( 'ol.references li' ).each(function(i, el) {
				references[ $(el).attr( 'id' ) ] = {
					html: $(el).html()
				};
			});
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
			$( document ).scroll(calculatePosition);
		}
		function getOptions( options ) {
			var hashtest;
			options = options || {};
			if( !options.animationSpeed ) {
				hashtest = window.location.hash.substr(1).match(/refspeed:([0-9]*)/);
				options.animationSpeed = hashtest ? parseInt( hashtest[1], 10 ) : 500;
			}
			if( !options.animation ) {
				hashtest = window.location.hash.substr(1).match(/refanimation:([a-z]*)/);
				options.animation = hashtest ? hashtest[1] : null;
			}
			return options;
		}

		function getReferenceTop() {
			// http://bugs.jquery.com/ticket/6724
			var winHeight = window.innerHeight || $( window ).height();
			return winHeight + $( window ).scrollTop();
		}

		/*
		init
			options:
				animation: <string>
					Define the animation that should run on clicking a reference
					Possible values: 'none', 'fade', 'slide'
				animationSpeed: <integer>
					The time in milliseconds the open reference animation should take
				onClickReference: <function>
					Define a handler that is run upon clicking a reference
		*/
		function init( container, firstRun, options ) {
			var el, close, lastLink, data, html, href, references = collect();
			options = getOptions( options );
			container = container || $( '#content' )[0];
			firstRun = typeof( firstRun ) === 'undefined' ? true : firstRun;
			$( '#mf-references' ).remove();
			el = $( '<div id="mf-references"><div></div></div>' ).hide().
				appendTo( document.body )[0];
			function cancelBubble( ev ) {
				ev.stopPropagation();
			}
			el.ontouchstart = cancelBubble;
			close = function() {
				if( !$( '#mf-references' ).is( ':visible' ) ) {
					return;
				}
				var top;
				lastLink = null;
				if( options.animation === 'none' ) {
					$( '#mf-references' ).hide();
				} else if( options.animation === 'fade' ) {
					$( '#mf-references' ).fadeOut( options.animationSpeed );
				} else {
					top = getReferenceTop();
					if( !supportsPositionFixed() ) {
						$( '#mf-references' ).show().animate( { top: top }, { duration: options.animationSpeed,
								complete: function() {
									$( '#mf-references' ).hide();
								}
							});
					} else {
						$( '#mf-references' ).slideUp();
					}
				}
			};
			$( '<button>close</button>' ).click( close ).appendTo( '#mf-references' );
			$( '.mw-cite-backlink a' ).click( close );

			function clickReference(ev) {
				var top, oh;
				href = $( this ).attr( 'href' );
				data = href && href.charAt(0) === '#' ?
					references[ href.substr( 1, href.length ) ] : null;

				if( !$( '#mf-references' ).is( ':visible' ) || lastLink !== href) {
					lastLink = href;
					if( data ) {
						html = '<h3>' + $( this ).text() + '</h3>' + data.html;
					} else {
						html = $( '<a />' ).text( $(this).text() ).
							attr( 'href', href ).appendTo( '<div />' ).parent().html();
					}
					$( '#mf-references div' ).html( html );
					$( '#mf-references div sup a' ).click( clickReference );
					calculatePosition();
					if( options.animation === 'none' ) {
						$( '#mf-references' ).show();
					} else if( options.animation === 'fade' ){
						$( '#mf-references' ).fadeIn( options.animationSpeed );
					} else {
						if( !supportsPositionFixed() ) {
							top = getReferenceTop();
							oh = $( '#mf-references' ).outerHeight();
							$( '#mf-references' ).show().css( { 'top': top } ).
								animate( { top: top - oh }, options.animationSpeed );
						} else {
							$( '#mf-references' ).slideDown();
						}
					}
				} else {
					close();
				}
				if( options.onClickReference ) {
					options.onClickReference( ev );
				}
				ev.preventDefault();
				cancelBubble( ev );
			}
			$( 'sup a', container ).unbind( 'click' ).
				click( clickReference ).each(function(i, el) {
					el.ontouchstart = cancelBubble;
				});
			if( firstRun ) {
				$( window ).scroll(function( ev ) {
					close();
				});
				$( document.body ).bind( 'click', close );
				$( document.body ).bind( 'touchstart', function() {
					$( '#mf-references' ).hide();
				});
			}
		}
		return {
			init: init
		};
	}(jQuery));

	M.registerModule( 'references', references );
}
}( mw.mobileFrontend ));
