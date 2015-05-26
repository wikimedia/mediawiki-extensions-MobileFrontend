( function ( M, $ ) {
	var Schema = M.require( 'Schema' ),
		SchemaMobileWebSearch,
		context = M.require( 'context' );

	/**
	 * @class SchemaMobileWebSearch
	 * @extends Schema
	 */
	SchemaMobileWebSearch = Schema.extend( {
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
		 *  that the user is using. One of "stable", "beta", or "alpha"
		 */
		defaults: $.extend( {}, Schema.prototype.defaults, {
			platform: 'mobileweb',
			platformVersion: context.getMode()
		} )
	} );

	M.define( 'loggingSchemas/SchemaMobileWebSearch', SchemaMobileWebSearch );

}( mw.mobileFrontend, jQuery ) );
