( function( M, $ ) {

	var EventEmitter = M.require( 'eventemitter' ),
		user = M.require( 'user' ),
		Api, api;

	/**
	 * JavaScript wrapper for a horrible API. Use to retrieve things.
	 * @class Api
	 * @extends EventEmitter
	 */
	Api = EventEmitter.extend( mw.Api.prototype ).extend( {
		apiUrl: mw.util.wikiScript( 'api' ),

		/**
		 * Constructor, if you override it, use _super().
		 *
		 * @method
		 */
		initialize: function() {
			mw.Api.apply( this, arguments );
			this.requests = [];
			this.tokenCache = {};
		},

		/**
		 * A wrapper for $.ajax() to be used when calling server APIs.
		 * Sets URL to API URL and default data type to JSON.
		 * Preprocesses data argument in the following way:
		 * - removes boolean values equal to false
		 * - concatenates Array values with '|'
		 *
		 *     @example
		 *     <code>
		 *     ajax( { a: false, b: [1, 2, 3] }, { type: 'post' } );
		 *     // is equal to
		 *     $.ajax( {
		 *         type: 'post',
		 *         data: { b: '1|2|3' }
		 *     } );
		 *     </code>
		 *
		 * @method
		 * @param {Object} data Data to be preprocessed and added to options
		 * @param {Object} options Parameters passed to $.ajax()
		 * @return {jQuery.Deferred} Object returned by $.ajax()
		 */
		ajax: function( data, options ) {
			var key, request, self = this;

			options = options || {};

			if ( typeof data !== 'string' ) {
				for ( key in data ) {
					if ( data[key] === false ) {
						delete data[key];
					} else if ( $.isArray( data[key] ) ) {
						data[key] = data[key].join( '|' );
					}
				}
			}

			// FIXME: move to mw.Api (although no EventEmitter in core)?
			options.xhr = function() {
				var xhr = $.ajaxSettings.xhr();
				if ( xhr.upload && ( mw.config.get( 'wgMFAjaxUploadProgressSupport' ) ) ) {
					// need to bind this event before we open the connection (see note at
					// https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest/Using_XMLHttpRequest#Monitoring_progress)
					xhr.upload.addEventListener( 'progress', function( ev ) {
						if ( ev.lengthComputable ) {
							self.emit( 'progress', request, ev.loaded / ev.total );
						}
					} );
				}
				return xhr;
			};

			request = mw.Api.prototype.ajax.call( this, data, options );
			this.requests.push( request );
			return request;
		},

		/**
		 * Abort all unfinished requests issued by this Api object.
		 *
		 * @method
		 */
		// FIXME: move to mw.Api
		abort: function() {
			this.requests.forEach( function( request ) {
				request.abort();
			} );
		},

		/**
		 * Retrieves a token for a given endpoint
		 *
		 * @method
		 * @param {String} tokenType Name of the type of token needed e.g. edit, upload - defaults to edit
		 * @param {String} endpoint Optional alternative host to query via CORS
		 * @param {String} caToken Optional additional CentralAuth token to be
		 * sent with the request. This is needed for requests to external wikis
		 * where the user is not logged in. caToken is for single use only.
		 * @return {jQuery.Deferred} Object returned by $.ajax(), callback will be passed
		 *   the token string, false if the user is anon or undefined where not available or a warning is set
		 */
		// FIXME: consolidate with mw.Api
		getToken: function( tokenType, endpoint, caToken ) {
			var token, data, d = $.Deferred(), isCacheable,
				// token types available from mw.user.tokens
				easyTokens = [ 'edit', 'watch', 'patrol' ];

			tokenType = tokenType || 'edit';
			isCacheable = tokenType !== 'centralauth';

			if ( !this.tokenCache[ endpoint ] ) {
				this.tokenCache[ endpoint ] = {};
			}

			// If the user is anonymous and anonymous editing is disabled, reject the request.
			// FIXME: Per the separation of concerns design principle, we should probably
			// not be worrying about whether or not the user is anonymous within getToken.
			// We'll need to check upstream usage though before removing this.
			if ( user.isAnon() && !mw.config.get( 'wgMFAnonymousEditing' ) ) {
				return d.reject( 'Token requested when not logged in.' );
			// If the token is cached, return it from cache.
			} else if ( isCacheable && this.tokenCache[ endpoint ].hasOwnProperty( tokenType ) ) {
				return this.tokenCache[ endpoint ][ tokenType ];
			// If the token is available from mw.user.tokens, get it from there.
			} else if ( easyTokens.indexOf( tokenType ) > -1 && !endpoint && !caToken ) {
				token = user.tokens.get( tokenType + 'Token' );
				if ( token && ( token !== '+\\' || mw.config.get( 'wgMFAnonymousEditing' ) ) ) {
					d.resolve( token );
				} else {
					d.reject( 'Anonymous token.' );
				}
			// Otherwise, make an API request for the token.
			} else {
				data = {
					action: 'tokens',
					type: tokenType
				};
				if ( endpoint ) {
					data.origin = M.getOrigin();
					if ( caToken ) {
						data.centralauthtoken = caToken;
					}
				}
				this.ajax( data, {
					url: endpoint || this.apiUrl,
					xhrFields: { withCredentials: true }
				} ).done( function( tokenData ) {
					if ( tokenData && tokenData.tokens && !tokenData.warnings ) {
						token = tokenData.tokens[ tokenType + 'token' ];
						if ( token && ( token !== '+\\' || mw.config.get( 'wgMFAnonymousEditing' ) ) ) {
							d.resolve( token );
						} else {
							d.reject( 'Anonymous token.' );
						}
					} else {
						d.reject( 'Bad token name.' );
					}
				} ).fail( function() {
					d.reject( 'Failed to retrieve token.' );
				} );
			}
			// Cache the token
			this.tokenCache[ endpoint ][ tokenType ] = d;
			return d;
		}
	} );

	api = new Api();
	api.Api = Api;

	M.define( 'api', api );

}( mw.mobileFrontend, jQuery ) );
