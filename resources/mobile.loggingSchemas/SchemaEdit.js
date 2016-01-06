( function ( M, $ ) {
	var Schema = M.require( 'mobile.startup/Schema' ),
		user = M.require( 'mobile.user/user' );

	/**
	 * @class SchemaEdit
	 * @extends Schema
	 */
	function SchemaEdit() {
		Schema.apply( this, arguments );
	}

	OO.mfExtend( SchemaEdit, Schema, {
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
			if ( mw.loader.getState( 'schema.Edit' ) === null ) {
				// Only route any events into the Edit schema if the module is actually available.
				// It won't be if EventLogging is installed but WikimediaEvents is not.
				return $.Deferred().reject( 'schema.Edit not loaded.' );
			}

			data['action.' + data.action + '.type'] = data.type;
			delete data.type;
			data['action.' + data.action + '.mechanism'] = data.mechanism;
			delete data.mechanism;
			// data['action.' + data.action + '.timing'] = Math.round( computeDuration( ... ) );
			data['action.' + data.action + '.message'] = data.message;
			delete data.message;

			mw.track( 'event.Edit', $.extend( {}, this.defaults, data ) );
			return $.Deferred().resolve();
		}
	} );

	M.define( 'mobile.loggingSchemas/SchemaEdit', SchemaEdit );

} )( mw.mobileFrontend, jQuery );
