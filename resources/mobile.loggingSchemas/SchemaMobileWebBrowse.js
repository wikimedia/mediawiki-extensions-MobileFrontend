( function ( M, $ ) {
	var Schema = M.require( 'Schema' ),
		context = M.require( 'context' ),
		SchemaMobileWebBrowse;

	/**
	 * Implement schema defined at https://meta.wikimedia.org/wiki/Schema:MobileWebBrowse
	 * @class SchemaMobileWebBrowse
	 * @extends Schema
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
