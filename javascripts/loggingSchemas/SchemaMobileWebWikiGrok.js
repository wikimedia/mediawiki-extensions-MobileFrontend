( function ( M, $ ) {
	var SchemaMobileWebWikiGrok,
		user = M.require( 'user' ),
		Schema = M.require( 'Schema' );

	/**
	 * @class SchemaMobileWebWikiGrok
	 * @extends Schema
	 */
	SchemaMobileWebWikiGrok = Schema.extend( {
		/** @inheritdoc **/
		name: 'MobileWebWikiGrok',
		defaults: $.extend( {}, Schema.prototype.defaults, {
			// FIXME: Introduce a SchemaWithUser class that has username and userEditCount
			isLoggedIn: !user.isAnon(),
			userEditCount: user.getEditCount() || 0,
			pageId: mw.config.get( 'wgArticleId' )
		} )
	} );

	M.define( 'loggingSchemas/SchemaMobileWebWikiGrok', SchemaMobileWebWikiGrok );

} )( mw.mobileFrontend, jQuery );
