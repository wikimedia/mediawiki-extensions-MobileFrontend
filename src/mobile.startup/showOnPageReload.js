var
	storageKey = 'mobileFrontend/toast';

/**
 * Show the previously saved toast data and delete it from storage
 *
 * @memberof Toast
 * @instance
 * @private
 */
function showPending() {
	var data = mw.storage.get( storageKey );
	if ( data ) {
		data = JSON.parse( data );
		mw.notify( data.content, data.options );
		mw.storage.remove( storageKey );
	}
}

mw.requestIdleCallback( showPending );

/**
 * Save the toast data in storage so that we can show it on page reload.
 * Also check whether there is a pending message that's not shown yet.
 * If yes, output a warning message and discard this message.
 * This is to ensure that the page needs to be reloaded before adding
 * a new message for showing later.
 *
 * @memberof Toast
 * @instance
 * @param {string} content Content to be placed in element
 * @param {Object|string} [options]
 *  If a string (deprecated) CSS class to add to the element
 *  If an object, more options for the notification see mw.notification.show.
 *  For backwards compatibility reasons if a string is given it will be
 *  treated as options.type
 */
function showOnPageReload( content, options ) {
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
}

module.exports = { showOnPageReload: showOnPageReload };
