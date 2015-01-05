( function ( M, $, OO ) {

	var EventEmitter,
		Class = M.require( 'Class' );

	// HACK: wrap around oojs's EventEmitter
	// This needs some hackery to make oojs's
	// and MobileFrontend's different OO models get along,
	// and we need to alias one() to once().
	/**
	 * A base class with support for event emitting.
	 * @class EventEmitter
	 * @extends Class
	 * @uses OO.EventEmitter
	**/
	EventEmitter = Class.extend( $.extend( {
		initialize: OO.EventEmitter
	}, OO.EventEmitter.prototype ) );

	M.define( 'eventemitter', EventEmitter );
	// FIXME: if we want more of M's functionality in loaded in <head>,
	// move this to a separate file
	$.extend( mw.mobileFrontend, new EventEmitter() );

}( mw.mobileFrontend, jQuery, OO ) );
