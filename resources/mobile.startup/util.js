( function ( M, $ ) {
	var util,
		$window = $( window );

	/**
	 * Utility library
	 * @class util
	 * @singleton
	 */
	util = {
		/**
		 * Escape dots and colons in a hash, jQuery doesn't like them beause they
		 * look like CSS classes and pseudoclasses. See
		 * http://bugs.jquery.com/ticket/5241
		 * http://stackoverflow.com/questions/350292/how-do-i-get-jquery-to-select-elements-with-a-period-in-their-id
		 *
		 * @method
		 * @param {String} hash A hash to escape
		 * @return {String}
		 */
		escapeHash: function ( hash ) {
			return hash.replace( /(:|\.)/g, '\\$1' );
		},
		/**
		 * Return wgWikiBaseItemID config variable or 'wikidataid' query parameter if exits
		 * @returns {null|String}
		 */
		getWikiBaseItemId: function () {
			var id = mw.config.get( 'wgWikibaseItemId' ),
				idOverride;

			if ( !id ) {
				idOverride = mw.util.getParamValue( 'wikidataid' );
				if ( idOverride ) {
					mw.config.set( 'wgWikibaseItemId', idOverride );
					id = idOverride;
				}
			}
			return id;
		},

		/**
		 * Check if at least half of the element's height and half of its width are in viewport
		 *
		 * @method
		 * @param {jQuery.Object} $el - element that's being tested
		 * @return {Boolean}
		 */
		isElementInViewport: function ( $el ) {
			var windowHeight = $window.height(),
				windowWidth = $window.width(),
				windowScrollLeft = $window.scrollLeft(),
				windowScrollTop = $window.scrollTop(),
				elHeight = $el.height(),
				elWidth = $el.width(),
				elOffset = $el.offset();

			return (
				( windowScrollTop + windowHeight >= elOffset.top + elHeight / 2 ) &&
				( windowScrollLeft + windowWidth >= elOffset.left + elWidth / 2 ) &&
				( windowScrollTop <= elOffset.top + elHeight / 2 )
			);
		}
	};

	M.define( 'mobile.startup/util', util );

}( mw.mobileFrontend, jQuery ) );
