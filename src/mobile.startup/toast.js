var
	util = require( './util' ),
	storageKey = 'mobileFrontend/toast';

/**
 * Wrapper for one global Toast
 * @class Toast
 */
function Toast() {
	mw.requestIdleCallback( this._showPending.bind( this ) );
}

/**
 * Show a message with the given class in a toast.
 * @memberof Toast
 * @instance
 * @param {string} msg Message to show in the toast
 * @param {Object|string} [options]
 *  If a string (deprecated) CSS class to add to the element
 *  If an object, more options for the notification see mw.notification.show.
 *  For backwards compatibility reasons if a string is given it will be
 *  treated as options.type
 */
Toast.prototype.show = function ( msg, options ) {
	if ( typeof options === 'string' ) {
		mw.log.warn( 'The use of the cssClass parameter of Toast.show is deprecated, please convert it to an ' +
				'options object.' );
		options = {
			type: options
		};
	}

	options = util.extend( {
		tag: 'toast'
	}, options );

	this.notification = mw.notify( msg, options );
};

/**
 * Hide the Toast if it's visible.
 * @memberof Toast
 * @instance
 */
Toast.prototype.hide = function () {
	if ( this.notification !== undefined ) {
		this.notification.then( function ( notif ) {
			notif.close();
		} );
	}
};

/**
 * Save the toast data in storage so that we can show it on page reload.
 * Also check whether there is a pending message that's not shown yet.
 * If yes, output a warning message and discard this message.
 * This is to ensure that the page needs to be reloaded before adding
 * a new message for showing later.
 * @memberof Toast
 * @instance
 * @param {string} content Content to be placed in element
 * @param {Object|string} [options]
 *  If a string (deprecated) CSS class to add to the element
 *  If an object, more options for the notification see mw.notification.show.
 *  For backwards compatibility reasons if a string is given it will be
 *  treated as options.type
 */
Toast.prototype.showOnPageReload = function ( content, options ) {
	if ( mw.storage.get( storageKey ) ) {
		mw.log.warn(
			'A pending toast message already exits. ' +
				'The page should have been reloaded by now.'
		);
		return;
	}
	mw.storage.set( storageKey, JSON.stringify( {
		content: content,
		options: options
	} ) );
};

/**
 * Show the previously saved toast data and delete it from storage
 * @memberof Toast
 * @instance
 * @private
 */
Toast.prototype._showPending = function () {
	var data = mw.storage.get( storageKey );
	if ( data ) {
		data = JSON.parse( data );
		this.show( data.content, data.options );
		mw.storage.remove( storageKey );
	}
};

module.exports = new Toast();
