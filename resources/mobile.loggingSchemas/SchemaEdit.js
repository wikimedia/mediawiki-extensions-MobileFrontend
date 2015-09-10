( function ( M, $ ) {
	var SchemaEdit,
		Schema = M.require( 'Schema' ),
		user = M.require( 'user' );

	/**
	 * @class SchemaEdit
	 * @extends Schema
	 */
	SchemaEdit = Schema.extend( {
		/** @inheritdoc **/
		name: 'Edit',
		/**
		 * https://meta.wikimedia.org/wiki/Schema:Edit
		 * @inheritdoc
		 * @cfg {Object} defaults The options hash.
		 */
		defaults: $.extend( {}, Schema.prototype.defaults, {
			'page.id': mw.config.get( 'wgArticleId' ),
			'page.revid': mw.config.get( 'wgRevisionId' ),
			'page.title': mw.config.get( 'wgPageName' ),
			'page.ns': mw.config.get( 'wgNamespaceNumber' ),
			'user.id': user.getId(),
			'user.class': user.isAnon() ? 'IP' : undefined,
			'user.editCount': mw.config.get( 'wgUserEditCount', 0 ),
			'mediawiki.version': mw.config.get( 'wgVersion' ),
			platform: 'phone',
			integration: 'page',
			version: 1
		} ),
		/**
		 * @inheritdoc
		 */
		log: function ( data ) {
			data['action.' + data.action + '.type'] = data.type;
			delete data.type;
			data['action.' + data.action + '.mechanism'] = data.mechanism;
			delete data.mechanism;
			// data['action.' + data.action + '.timing'] = Math.round( computeDuration( ... ) );
			data['action.' + data.action + '.message'] = data.message;
			delete data.message;
			return Schema.prototype.log.call( this, data );
		}
	} );

	M.define( 'loggingSchemas/SchemaEdit', SchemaEdit );

} )( mw.mobileFrontend, jQuery );
