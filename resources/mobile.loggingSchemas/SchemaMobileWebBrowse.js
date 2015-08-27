( function ( M ) {
	var SchemaMobileWeb = M.require( 'loggingSchemas/SchemaMobileWeb' ),
		SchemaMobileWebBrowse;

	/**
	 * Implement schema defined at https://meta.wikimedia.org/wiki/Schema:MobileWebBrowse
	 * @class SchemaMobileWebBrowse
	 * @extends SchemaMobileWeb
	 */
	SchemaMobileWebBrowse = SchemaMobileWeb.extend( {
		/** @inheritdoc **/
		name: 'MobileWebBrowse'
	} );

	M.define( 'loggingSchemas/SchemaMobileWebBrowse', SchemaMobileWebBrowse );

}( mw.mobileFrontend ) );
