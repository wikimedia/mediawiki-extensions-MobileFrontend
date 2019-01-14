var
	loadingOverlay = require( './loadingOverlay' ),
	util = require( './util' );

/**
 * Utility library for looking up details on the current user
 * @class loader
 * @singleton
 */
module.exports = {
	// Exported to support testing and stubbing
	newLoadingOverlay: function () {
		return loadingOverlay();
	},
	/**
	 * Loads a module via ResourceLoader
	 * and displays a full screen LoadingOverlay during load time.
	 * @memberof loader
	 * @instance
	 * @param {string} name ResourceLoader module name to load asynchronously.
	 * @param {boolean} delegateHide if true the caller is responsible for hiding
	 *  the intermediate loader.
	 * @param {boolean} [showLoadingOverlay] if false a loading overlay will be hidden while
	 *  loading the module. Defaults to true.
	 * @return {jQuery.Promise}
	 */
	loadModule: function ( name, delegateHide, showLoadingOverlay ) {
		var loadingOverlay = this.newLoadingOverlay();

		showLoadingOverlay = ( showLoadingOverlay !== undefined ) ? showLoadingOverlay : true;
		if ( showLoadingOverlay ) {
			loadingOverlay.appendTo( document.body );
			loadingOverlay.show();
		}

		function hideOverlayIfNeeded() {
			if ( !delegateHide && showLoadingOverlay ) {
				loadingOverlay.hide();
			}
		}
		return mw.loader.using( name ).then( function () {
			hideOverlayIfNeeded();

			return loadingOverlay;
		}, function () {
			hideOverlayIfNeeded();

			return util.Deferred().reject().promise();
		} );
	}
};
