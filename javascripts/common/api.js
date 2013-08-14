( function( M, $ ) {

	var EventEmitter = M.require( 'eventemitter' ),
		apiUrl = mw.config.get( 'wgScriptPath', '' ) + '/api.php',
		Api, api;

	// TODO: this might be dangerous and cause conflicts with other code
	// should we move it to Api#ajax?
	$.ajaxSetup( {
		url: apiUrl,
		dataType: 'json',
		data: {
			format: 'json'
		}
	} );

	Api = EventEmitter.extend( {
		apiUrl: apiUrl,

		/**
		 * Constructor, if you override it, use _super().
		 *
		 * @param {Object} options Object passed to the constructor.
		 */
		initialize: function() {
			this.requests = [];
			this.tokenCache = {};
		},

		/**
		 * A wrapper for $.ajax() to be used when calling server APIs.
		 * Preprocesses data argument in the following way:
		 * - removes boolean values equal to false
		 * - concatenates Array values with '|'
		 *
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
		 * @param {Object} data Data to be preprocessed and added to options
		 * @param {Object} options Parameters passed to $.ajax()
		 * @return {jQuery.Deferred} Object returned by $.ajax()
		 */
		ajax: function( data, options ) {
			var key, request;
			options = $.extend( {}, options );

			if (
				typeof data !== 'string' &&
					( typeof FormData === 'undefined' || !( data instanceof FormData ) )
			) {
				for ( key in data ) {
					if ( data[key] === false ) {
						delete data[key];
					} else if ( $.isArray( data[key] ) ) {
						data[key] = data[key].join( '|' );
					}
				}
			}
			options.data = data;

			// FIXME: uncomment when https://bugzilla.wikimedia.org/show_bug.cgi?id=44921 is resolved
			/*
			options.xhr = function() {
				var xhr = $.ajaxSettings.xhr();
				if ( xhr.upload ) {
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
			*/

			request = $.ajax( options );
			this.requests.push( request );
			return request;
		},

		/**
		 * A wrapper for $.ajax() to be used when calling server APIs.
		 * Sends a GET request. See ajax() for details.
		 *
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
		 */
		abort: function() {
			this.requests.forEach( function( request ) {
				request.abort();
			} );
		},

		/**
		 * Retrieves a token for a given endpoint
		 *
		 * @param {String} tokenType: Name of the type of token needed e.g. edit, upload - defaults to edit
		 * @param {String} endpoint: Optional alternative host to query via CORS
		 * @param {String} caToken: Optional additional CentralAuth token to be
		 * sent with the request. This is needed for requests to external wikis
		 * where the user is not logged in. caToken is for single use only.
		 * @return {jQuery.Deferred} Object returned by $.ajax(), callback will be passed
		 *   the token string, false if the user is anon or undefined where not available or a warning is set
		 */
		getToken: function( tokenType, endpoint, caToken ) {
			var data, d = $.Deferred(), isCacheable;

			tokenType = tokenType || 'edit';
			isCacheable = tokenType !== 'centralauth';

			if ( !this.tokenCache[ endpoint ] ) {
				this.tokenCache[ endpoint ] = {};
			}
			if ( !M.isLoggedIn() ) {
				return d.reject( 'Token requested when not logged in.' );
			} else if ( isCacheable && this.tokenCache[ endpoint ].hasOwnProperty( tokenType ) ) {
				return this.tokenCache[ endpoint ][ tokenType ];
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
				} ).then( function( tokenData ) {
					var token;
					if ( tokenData && tokenData.tokens && !tokenData.warnings ) {
						token = tokenData.tokens[ tokenType + 'token' ];
						if ( token && token !== '+\\' ) {
							d.resolve( token );
						} else {
							d.reject( 'Anonymous token.' );
						}
					} else {
						d.reject( 'Bad token name.' );
					}
				} );
				this.tokenCache[ endpoint ][ tokenType ] = d;
				return d;
			}
		}
	} );

	api = new Api();
	api.Api = Api;

	M.define( 'api', api );

}( mw.mobileFrontend, jQuery ) );
