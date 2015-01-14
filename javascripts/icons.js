( function ( M, $ ) {

	var Icon = M.require( 'Icon' );

	/**
	 * A set of shared icons.
	 *
	 * Factory methods are used to keep separate features that use the same icons
	 * from accidentally manipulating one another's DOM when calling methods like
	 * `remove`.
	 *
	 * @class icons
	 * @singleton
	 * @uses Icon
	 */
	M.define( 'icons', {

		/**
		 * Gets a spinner icon.
		 *
		 * The icon should be used to inform the user that the front-end is
		 * communicating with the back-end.
		 *
		 * @param {Object} [options] See `Icon` for more details
		 * @return {Icon}
		 */
		spinner: function ( options ) {
			options = options || {};

			return new Icon( $.extend( options, {
				name: 'spinner',
				label: mw.msg( 'mobile-frontend-loading-message' ),
				additionalClassNames: 'spinner loading'
			} ) );
		}
	} );

}( mw.mobileFrontend, jQuery ) );
