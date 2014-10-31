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
		 * @return {jQuery.Deferred}
		 */
		loadModule: function ( name ) {
			var loadingOverlay = new LoadingOverlay();
			loadingOverlay.show();
			return mw.loader.using( name ).always( function () {
				loadingOverlay.hide();
			} );
		}
	}, M );

} ( mw.mobileFrontend, jQuery ) );
