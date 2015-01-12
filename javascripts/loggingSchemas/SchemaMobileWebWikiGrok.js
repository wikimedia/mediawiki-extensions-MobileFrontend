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
		/**
		 * @inheritdoc
		 *
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Boolean} defaults.isLoggedIn Whether the user is logged in
		 * @cfg {Number|undefined} defaults.userEditCount The number of edits the user has made
		 * if the user is logged in, otherwise - undefined. Assigning undefined will make event
		 * logger omit this property when sending the data to a server. According to the schema
		 * userEditCount is optional.
		 * @cfg {Number} defaults.pageId The value of the wgArticleId config variable
		 */
		defaults: $.extend( {}, Schema.prototype.defaults, {
			// FIXME: Introduce a SchemaWithUser class that has username and userEditCount
			isLoggedIn: !user.isAnon(),
			userEditCount: typeof user.getEditCount() === 'number' ? user.getEditCount() : undefined,
			pageId: mw.config.get( 'wgArticleId' )
		} )
	} );

	M.define( 'loggingSchemas/SchemaMobileWebWikiGrok', SchemaMobileWebWikiGrok );

} )( mw.mobileFrontend, jQuery );
