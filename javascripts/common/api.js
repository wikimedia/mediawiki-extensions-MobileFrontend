( function( M, $ ) {

	var EventEmitter = M.require( 'eventemitter' ),
		user = M.require( 'user' ),
		apiUrl = mw.config.get( 'wgScriptPath', '' ) + '/api.php',
		Api, api;

	/**
	 * JavaScript wrapper for a horrible API. Use to retrieve things.
	 * @class Api
	 * @extends EventEmitter
	 * @name Api
	 */
	Api = EventEmitter.extend( {
		apiUrl: apiUrl,

		/**
		 * Constructor, if you override it, use _super().
		 *
		 * @function
		 * @name Api.prototype.initialize
		 * @param {Object} options Object passed to the constructor.
		 */
		initialize: function() {
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
		 * @name Api.prototype.ajax
		 * @example
		 * <code>
		 * ajax( { a: false, b: [1, 2, 3] }, { type: 'post' } );
		 * // is equal to
		 * $.ajax( {
		 *     type: 'post',
		 *     data: { b: '1|2|3' }
		 * } );
		 * </code>
		 *
		 * @function
		 * @param {Object} data Data to be preprocessed and added to options
		 * @param {Object} options Parameters passed to $.ajax()
		 * @return {jQuery.Deferred} Object returned by $.ajax()
		 */
		ajax: function( data, options ) {
			var key, request, self = this, isFormData;
			options = $.extend( { url: apiUrl, dataType: 'json' }, options );
			isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

			if ( isFormData ) {
				data.append( 'format', 'json' );
			} else if ( typeof data !== 'string' ) {
				for ( key in data ) {
					if ( data[key] === false ) {
						delete data[key];
					} else if ( $.isArray( data[key] ) ) {
						data[key] = data[key].join( '|' );
					}
				}
				data = $.extend( { format: 'json' }, data );
			}
			options.data = data;

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

			request = $.ajax( options );
			this.requests.push( request );
			return request;
		},

		/**
		 * A wrapper for $.ajax() to be used when calling server APIs.
		 * Sends a GET request. See ajax() for details.
		 *
		 * @name Api.prototype.get
		 * @function
		 * @param {Object} data Data to be preprocessed and added to options
		 * @param {Object} options Parameters passed to $.ajax()
		 * @return {jQuery.Deferred} Object returned by $.ajax()
		 */
		get: function( data, options ) {
			options = $.extend( {}, options, { type: 'GET' } );
			return this.ajax( data, options );
		},

		/**
		 * A wrapper for $.ajax() to be used when calling server APIs.
		 * Sends a POST request. See ajax() for details.
		 *
		 * @name Api.prototype.post
		 * @function
		 * @param {Object} data Data to be preprocessed and added to options
		 * @param {Object} options Parameters passed to $.ajax()
		 * @return {jQuery.Deferred} Object returned by $.ajax()
		 */
		post: function( data, options ) {
			options = $.extend( {}, options, { type: 'POST' } );
			return this.ajax( data, options );
		},

		/**
		 * Abort all unfinished requests issued by this Api object.
		 *
		 * @name Api.prototype.abort
		 * @function
		 */
		abort: function() {
			this.requests.forEach( function( request ) {
				request.abort();
			} );
		},

		/**
		 * Retrieves a token for a given endpoint
		 *
		 * @name Api.prototype.getToken
		 * @function
		 * @param {String} tokenType Name of the type of token needed e.g. edit, upload - defaults to edit
		 * @param {String} endpoint Optional alternative host to query via CORS
		 * @param {String} caToken Optional additional CentralAuth token to be
		 * sent with the request. This is needed for requests to external wikis
		 * where the user is not logged in. caToken is for single use only.
		 * @return {jQuery.Deferred} Object returned by $.ajax(), callback will be passed
		 *   the token string, false if the user is anon or undefined where not available or a warning is set
		 */
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
	// FIXME: Hack until bug 57629 is resolved.
	// Substitute if absent
	if ( typeof mw.Api === 'undefined' ) {
		mw.Api = Api;
	}

	M.define( 'api', api );

}( mw.mobileFrontend, jQuery ) );
