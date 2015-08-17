( function ( M, $ ) {
	var Schema = M.require( 'mobile.startup/Schema' ),
		context = M.require( 'mobile.context/context' );

	/**
	 * @class SchemaMobileWebSearch
	 * @extends Schema
	 */
	function SchemaMobileWebSearch() {
		Schema.apply( this, arguments );
	}

	OO.mfExtend( SchemaMobileWebSearch, Schema, {
		/** @inheritdoc **/
		name: 'MobileWebSearch',
		/** @inheritdoc */
		isSampled: true,
		/**
		 * Sampled at 0.1% (consistent with the Desktop search rate)
		 * @inheritdoc
		 */
		samplingRate: 1 / 1000,
		/**
		 * @inheritdoc
		 *
		 * @cfg {Object} defaults The options hash.
		 * @cfg {String} defaults.platform Always "mobileweb"
		 * @cfg {String} defaults.platformVersion The version of MobileFrontend
		 *  that the user is using. One of "stable" or "beta"
		 */
		defaults: $.extend( {}, Schema.prototype.defaults, {
			platform: 'mobileweb',
			platformVersion: context.getMode()
		} )
	} );

	M.define( 'mobile.loggingSchemas/SchemaMobileWebSearch', SchemaMobileWebSearch );

}( mw.mobileFrontend, jQuery ) );
