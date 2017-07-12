( function ( M ) {
	var loader,
		LoadingOverlay = M.require( 'mobile.startup/LoadingOverlay' );

	/**
	 * Utility library for looking up details on the current user
	 * @class loader
	 * @singleton
	 */
	loader = {
		/**
		 * Loads a module via ResourceLoader, displays a full screen LoadingOverlay during load time.
		 * @method
		 * @param {string} name ResourceLoader module name to load asynchronously.
		 * @param {boolean} delegateHide if true the caller is responsible for hiding the intermediate loader.
		 * @param {boolean} [showLoadingOverlay] if false a loading overlay will be hidden while
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
	M.define( 'mobile.startup/rlModuleLoader', loader ) // resource-modules-disable-line
		.deprecate( 'mobile.overlays/moduleLoader' );

}( mw.mobileFrontend ) );
