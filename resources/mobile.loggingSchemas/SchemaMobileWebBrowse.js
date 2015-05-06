( function ( M, $ ) {
	var Schema = M.require( 'Schema' ),
		context = M.require( 'context' ),
		SchemaMobileWebBrowse;

	/**
	 * @class SchemaMobileWebBrowse
	 * @extends Schema
	 * @see https://meta.wikimedia.org/wiki/Schema:MobileWebBrowse
	 */
	SchemaMobileWebBrowse = Schema.extend( {
		/** @inheritdoc **/
		name: 'MobileWebBrowse',
		/**
		 * @inheritdoc
		 *
		 * @cfg {Object} defaults The options hash.
		 * @cfg {String} defaults.mobileMode The version of MobileFrontend
		 *  that the user is using. One of "stable", "beta", or "alpha"
		 */
		defaults: $.extend( {}, Schema.prototype.defaults, {
			mobileMode: context.getMode()
		} )
	} );

	M.define( 'loggingSchemas/SchemaMobileWebBrowse', SchemaMobileWebBrowse );

}( mw.mobileFrontend, jQuery ) );
