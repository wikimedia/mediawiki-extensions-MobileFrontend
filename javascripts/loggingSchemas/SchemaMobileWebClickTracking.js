( function ( M, $ ) {
	var SchemaMobileWebClickTracking,
		Schema = M.require( 'Schema' ),
		user = M.require( 'user' ),
		s = M.require( 'settings' );

	/**
	 * Using localStorage track an event but delay recording it on the
	 * server until the next page load. Throw an error if schema is not
	 * one of the predefined values.
	 *
	 * @method
	 * @ignore
	 * @param {String} schemaName valid schema name.
	 * @param {String} name of click tracking event to log
	 * @param {String} href the link that has been clicked.
	 */
	function futureLog( schemaName, name, href ) {
		s.save( 'MobileWebClickTracking-schema', schemaName );
		s.save( 'MobileWebClickTracking-name', name );
		s.save( 'MobileWebClickTracking-href', href );
	}

	/**
	 * Log a past click tracking event to the server.
	 * @method
	 * @ignore
	 */
	function logPastEvent() {
		var schema,
			schemaName = s.get( 'MobileWebClickTracking-schema' ),
			name = s.get( 'MobileWebClickTracking-name' ),
			href = s.get( 'MobileWebClickTracking-href' );

		// Make sure they do not log a second time...
		if ( schemaName && name && href ) {
			s.remove( 'MobileWebClickTracking-schema' );
			s.remove( 'MobileWebClickTracking-name' );
			s.remove( 'MobileWebClickTracking-href' );
			schema = new SchemaMobileWebClickTracking( {
				name: name,
				destination: href
			}, schemaName );
			schema.log();
		}
	}

	/**
	 * @class SchemaMobileWebClickTracking
	 * @extends Schema
	 */
	SchemaMobileWebClickTracking = Schema.extend( {
		/**
		 * @inheritdoc
		 *
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String|undefined} defaults.username Username if the user is logged in, otherwise -
		 * undefined. Assigning undefined will make event logger omit this property when sending
		 * the data to a server. According to the schema username is optional.
		 * @cfg {Number|undefined} defaults.userEditCount The number of edits the user has made
		 * if the user is logged in, otherwise - undefined. Assigning undefined will make event
		 * logger omit this property when sending the data to a server. According to the schema
		 * userEditCount is optional.
		 */
		defaults: $.extend( {}, Schema.prototype.defaults, {
			// FIXME: Introduce a SchemaWithUser class that has username and userEditCount
			username: user.getName() || undefined,
			userEditCount: typeof user.getEditCount() === 'number' ? user.getEditCount() : undefined
		} ),
		/**
		 * @inheritdoc
		 */
		isSampled: true,
		/**
		 * Record a click to a link in the schema. Throw an error if schema is not
		 * one of the predefined values.
		 *
		 * @method
		 * @ignore
		 * @param {String} selector of element
		 * @param {String} name unique to this click tracking event that will allow
		 * you to distinguish it from others.
		 */
		hijackLink: function ( selector, name ) {
			var schemaName = this.name;
			$( selector ).on( 'click', function () {
				futureLog( schemaName, name, $( this ).attr( 'href' ) );
			} );
		}
	} );

	// FIXME: Refactor so it's possible for different schemas to log future events.
	// Then this should be moved to init.js - including a class should not have side effects.
	logPastEvent();

	M.define( 'loggingSchemas/SchemaMobileWebClickTracking', SchemaMobileWebClickTracking );
} )( mw.mobileFrontend, jQuery );
