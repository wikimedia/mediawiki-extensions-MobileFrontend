jQuery( function( $ ) {
	// http://stackoverflow.com/a/12621264/365238
	function supports3dTransforms() {
		var el = $( '<p>' )[0], $iframe = $( '<iframe>' ), has3d, t,
			transforms = {
				'webkitTransform': '-webkit-transform',
				//'OTransform': '-o-transform',
				//'msTransform': '-ms-transform',
				'transform': 'transform'
			};

		// Add it to the body to get the computed style
		// Sandbox it inside an iframe to avoid Android Browser quirks
		$iframe.appendTo( 'body' ).contents().find( 'body' ).append( el );

		for ( t in transforms ) {
			if ( el.style[t] !== undefined ) {
				el.style[t] = 'translate3d(1px,1px,1px)';
				has3d = window.getComputedStyle( el ).getPropertyValue( transforms[t] );
			}
		}

		$iframe.remove();

		return has3d !== undefined && has3d.length > 0 && has3d !== "none";
	}

	if ( supports3dTransforms() ) {
		$( 'html' ).addClass( 'transforms' );
	}
} );
