( function ( M ) {
	var loader,
		LoadingOverlay = M.require( 'LoadingOverlay' );

	/**
	 * Utility library for looking up details on the current user
	 * @class loader
	 * @singleton
	 */
	loader = {
		/**
		 * Loads a module via ResourceLoader, displays a full screen LoadingOverlay during load time.
		 * @method
		 * @param {String} name ResourceLoader module name to load asynchronously.
		 * @param {Boolean} delegateHide if true the caller is responsible for hiding the intermediate loader.
		 * @param {Boolean} [showLoadingOverlay] if false a loading overlay will be hidden while
		 *  loading the module. Defaults to true.
		 * @return {jQuery.Deferred}
		 */
		loadModule: function ( name, delegateHide, showLoadingOverlay ) {
			var loadingOverlay = new LoadingOverlay();

			showLoadingOverlay = ( showLoadingOverlay !== undefined ) ? showLoadingOverlay : true;
			if ( showLoadingOverlay ) {
				loadingOverlay.show();
			}
			return mw.loader.using( name ).then( function () {
				return loadingOverlay;
			} ).always( function () {
				if ( !delegateHide && showLoadingOverlay ) {
					loadingOverlay.hide();
				}
			} );
		}
	};
	M.define( 'loader', loader );

}( mw.mobileFrontend ) );
