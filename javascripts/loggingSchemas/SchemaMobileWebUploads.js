( function ( M, $ ) {
	var SchemaMobileWebUploads,
		user = M.require( 'user' ),
		Schema = M.require( 'Schema' );

	/**
	 * @class SchemaMobileWebUploads
	 * @extends Schema
	 */
	SchemaMobileWebUploads = Schema.extend( {
		/** @inheritdoc **/
		name: 'MobileWebUploads',
		/** @inheritdoc **/
		defaults: $.extend( {}, Schema.prototype.defaults, {
			pageId: mw.config.get( 'wgArticleId' ),
			token: Schema.getSessionId(),
			funnel: 'unknown',
			// FIXME: Introduce a SchemaWithUser class and rethink the data recorded that follows
			username: user.getName(),
			isLoggedIn: !user.isAnon(),
			isEditable: mw.config.get( 'wgIsPageEditable' )
		} )
	} );

	M.define( 'loggingSchemas/SchemaMobileWebUploads', SchemaMobileWebUploads );

}( mw.mobileFrontend, jQuery ) );
