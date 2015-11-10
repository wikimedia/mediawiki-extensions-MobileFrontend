( function ( M ) {

	var Api, api,
		EventEmitter = M.require( 'mobile.oo/eventemitter' );

	/**
	 * A backwards compatibility layer for existing extensions of the Api
	 * class that haven't yet been converted to gateways.
	 *
	 * The remaining classes that extend the API are:
	 *
	 * * PageApi
	 * * WatchstarApi
	 *
	 * @class Api
	 * @extends EventEmitter
	 */
	Api = EventEmitter.extend( mw.Api.prototype ).extend( {
		/**
		 * @inheritdoc
		 */
		initialize: function () {
			mw.Api.apply( this, arguments );
			EventEmitter.prototype.initialize.apply( this, arguments );
		}
	} );

	api = new Api();
	api.Api = Api;

	M.deprecate( 'mobile.startup/api', api, 'mw.Api' );

}( mw.mobileFrontend ) );
