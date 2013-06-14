( function( M, $ ) {

	function callbackProxy( callback ) {
		return function() {
			var args = Array.prototype.slice.call( arguments, 1 );
			callback.apply( callback, args );
		};
	}

	function EventEmitter() {}

	/**
	 * Bind a callback to the event.
	 *
	 * @param {string} event Event name.
	 * @param {Function} callback Callback to be bound.
	 */
	EventEmitter.prototype.on = function( event, callback ) {
		$( this ).on( event, callbackProxy( callback ) );
		return this;
	};

	/**
	 * Bind a callback to the event and run it only once.
	 *
	 * @param {string} event Event name.
	 * @param {Function} callback Callback to be bound.
	 */
	EventEmitter.prototype.one = function( event, callback ) {
		$( this ).one( event, callbackProxy( callback ) );
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
		// use .triggerHandler() for emitting events to avoid accidentally
		// invoking object's functions, e.g. don't call obj.something() when
		// doing obj.emit( 'something' )
		$( this ).triggerHandler( event, args );
		return this;
	};

	M.define( 'eventemitter', EventEmitter );

}( mw.mobileFrontend, jQuery ) );
