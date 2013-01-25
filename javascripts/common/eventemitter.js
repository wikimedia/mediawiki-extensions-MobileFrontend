( function( M, $ ) {

	function EventEmitter() {}

	/**
	 * Bind a callback to the event.
	 *
	 * @param {string} event Event name.
	 * @param {Function} callback Callback to be bound.
	 */
	EventEmitter.prototype.on = function( event, callback ) {
		$( this ).on( event, function() {
			var args = Array.prototype.slice.call( arguments, 1 );
			callback.apply( callback, args );
		} );
		return this;
	};

	/**
	 * Emit an event. This causes all bound callbacks to be run.
	 *
	 * @param {string} event Event name.
	 * @param {*} [arguments] Optional arguments to be passed to callbacks.
	 */
	EventEmitter.prototype.emit = function( event /* , arg1, arg2, ... */ ) {
		var args = Array.prototype.slice.call( arguments, 1 );
		$( this ).trigger( event, args );
		return this;
	};

	M.define( 'eventemitter', EventEmitter );

}( mw.mobileFrontend, jQuery ) );
