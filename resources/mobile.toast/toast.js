( function ( M, $ ) {
	var Toast,
		settingsKey = 'mobileFrontend/toast',
		settings = M.require( 'mobile.settings/settings' ),
		ToastDrawer = M.require( 'mobile.toast/ToastDrawer' );

	/**
	 * Wrapper for one global ToastDrawer
	 * @class
	 */
	Toast = function Toast() {
		// FIXME: Use mw.requestIdleCallback, once it's available (T111456)
		$( this._showPending() );
	};

	/**
	 * Get a unique, global ToastDrawer object
	 * @return {ToastDrawer}
	 * @private
	 * @method
	 */
	Toast.prototype._getToastDrawer = function () {
		// check, if there is a ToastDrawer object already
		if ( this.drawer === undefined ) {
			this.drawer = new ToastDrawer();
		}
		return this.drawer;
	};

	/**
	 * Show a message with the given class in a toast.
	 * @method
	 * @param {String} msg Message to show in the toast
	 * @param {String} cssClass CSS class to add to the element
	 */
	Toast.prototype.show = function ( msg, cssClass ) {
		this._getToastDrawer().show( msg, cssClass );
	};

	/**
	 * Hide the ToastDrawer if it's visible.
	 * @method
	 */
	Toast.prototype.hide = function () {
		this._getToastDrawer().hide();
	};

	/**
	 * Save the toast data in settings so that we can show it on page reload.
	 * Also check whether there is a pending message that's not shown yet.
	 * If yes, output a warning message and discard this message.
	 * This is to ensure that the page needs to be reloaded before adding
	 * a new message for showing later.
	 * @method
	 * @param {String} content Content to be placed in element
	 * @param {String} className class to add to element
	 */
	Toast.prototype.showOnPageReload = function ( content, className ) {
		if ( settings.get( settingsKey ) ) {
			mw.log.warn(
				'A pending toast message already exits. ' +
				'The page should have been reloaded by now.'
			);
			return;
		}
		settings.save( settingsKey, JSON.stringify( {
			content: content,
			className: className
		} ) );
	};

	/**
	 * Show the previously saved toast data and delete it from settings
	 * @private
	 */
	Toast.prototype._showPending = function () {
		var data = settings.get( settingsKey );
		if ( data ) {
			data = JSON.parse( data );
			this._getToastDrawer().show( data.content, data.className );
			settings.remove( settingsKey );
		}
	};

	M.define( 'mobile.toast/toast', new Toast() );

}( mw.mobileFrontend, jQuery ) );
