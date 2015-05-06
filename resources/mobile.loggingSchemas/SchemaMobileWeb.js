( function ( M, $ ) {
	var SchemaMobileWeb,
		Schema = M.require( 'Schema' ),
		context = M.require( 'context' );

	/**
	 * @class SchemaMobileWeb
	 * @extends Schema
	 */
	SchemaMobileWeb = Schema.extend( {
		/**
		 * @inheritdoc
		 *
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.mobileMode whether user is in stable beta or alpha
		 */
		defaults: $.extend( {}, Schema.prototype.defaults, {
			mobileMode: context.getMode()
		} )
	} );

	M.define( 'loggingSchemas/SchemaMobileWeb', SchemaMobileWeb );
} )( mw.mobileFrontend, jQuery );
