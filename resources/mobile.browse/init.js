( function ( M, $ ) {
	var SchemaMobileWebBrowse = M.require( 'loggingSchemas/SchemaMobileWebBrowse' ),
		schema = new SchemaMobileWebBrowse(),
		$window = $( window ),
		$browseTags = $( '.browse-tags' ),
		timeoutID;

	/**
	 * Whether an element is visible to the user
	 * @param {jQuery.Object} $el
	 * @returns {Boolean}
	 */
	function isElementInViewport( $el ) {
		var windowHeight = $window.height(),
			windowWidth = $window.width(),
			windowScrollLeft = $window.scrollLeft(),
			windowScrollTop = $window.scrollTop(),
			elHeight = $el.height(),
			elWidth = $el.width(),
			elOffset = $el.offset();
		return (
			( elHeight > 0 && elWidth > 0 ) &&
			( windowScrollTop + windowHeight >= elOffset.top + elHeight / 2 ) &&
			( windowScrollLeft + windowWidth >= elOffset.left + elWidth / 2 ) &&
			( windowScrollTop <= elOffset.top + elHeight / 2 )
		);
	}

	/**
	 * Log tag_impression
	 */
	function logTagImpression() {
		if ( isElementInViewport( $browseTags ) ) {
			$window.off( 'resize.browse-tags scroll.browse-tags' );
			schema.log( {
				action: 'tags_impression'
			} );
		}
	}

	$( function () {
		if ( $browseTags.length ) {
			// track tags_impression
			$window.on(
				'resize.browse-tags scroll.browse-tags',
				function () {
					clearTimeout( timeoutID );
					timeoutID = setTimeout( logTagImpression, 250 );
				}
			);
			// try logging tags_impression on page load
			logTagImpression();

			// log tag_click
			$browseTags.find( 'a' ).one( 'click', function () {
				var $tag = $( this );

				schema.logBeacon( {
					action: 'tag_click',
					tag: $tag.text()
				} );
			} );
		}
	} );

}( mw.mobileFrontend, jQuery ) );
