/**
 * Mobile mode helper class
 *
 * @class mw.mobileFrontend
 * @singleton
 */
( function ( M, $ ) {
	var LoadingOverlay = M.require( 'LoadingOverlay' );

	mw.mobileFrontend = $.extend( {

		/**
		 * Loads a module via ResourceLoader, displays a full screen LoadingOverlay during load time.
		 * @method
		 * @param {string} name ResourceLoader module name to load asynchronously.
		 * @param {boolean} delegateHide if true the caller is responsible for hiding the intermediate loader.
		 * @return {jQuery.Deferred}
		 */
		loadModule: function ( name, delegateHide ) {
			var loadingOverlay = new LoadingOverlay();
			loadingOverlay.show();
			return mw.loader.using( name ).then( function () {
				return loadingOverlay;
			} ).always( function () {
				if ( !delegateHide ) {
					loadingOverlay.hide();
				}
			} );
		}
	}, M );

}( mw.mobileFrontend, jQuery ) );
