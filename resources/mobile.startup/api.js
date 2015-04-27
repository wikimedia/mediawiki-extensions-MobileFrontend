( function ( M, $ ) {

	var Api, api,
		EventEmitter = M.require( 'eventemitter' );

	/**
	 * JavaScript wrapper for a horrible API. Use to retrieve things.
	 * @class Api
	 * @extends EventEmitter
	 */
	Api = EventEmitter.extend( mw.Api.prototype ).extend( {
		/**
		 * @property {String} apiUrl
		 * URL to the api endpoint (api.php)
		 */
		apiUrl: mw.util.wikiScript( 'api' ),

		/**
		 * @inheritdoc
		 */
		initialize: function () {
			mw.Api.apply( this, arguments );
			EventEmitter.prototype.initialize.apply( this, arguments );
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
		ajax: function ( data, options ) {
			var key, request, self = this;

			options = options || {};

			if ( typeof data !== 'string' ) {
				for ( key in data ) {
					if ( data.hasOwnProperty( key ) ) {
						if ( data[key] === false ) {
							delete data[key];
						} else if ( $.isArray( data[key] ) ) {
							data[key] = data[key].join( '|' );
						}
					}
				}
			}

			/**
			 * This setups support for upload progress events.
			 * See https://dvcs.w3.org/hg/xhr/raw-file/tip/Overview.html#make-upload-progress-notifications
			 * FIXME: move to mw.Api (although no EventEmitter in core)?
			 * @ignore
			 * @returns {jqXHR}
			 */
			options.xhr = function () {
				var xhr = $.ajaxSettings.xhr();
				if ( xhr.upload ) {
					// need to bind this event before we open the connection (see note at
					// https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest/Using_XMLHttpRequest#Monitoring_progress)
					xhr.upload.addEventListener( 'progress', function ( ev ) {
						if ( ev.lengthComputable ) {
							/**
							 * @event progress
							 * Fired when a pending XHR request fires a progress event.
							 */
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
		 * FIXME: move to mw.Api
		 * @method
		 */
		abort: function () {
			$.each( this.requests, function ( index, request ) {
				request.abort();
			} );
		},

		/**
		 * Returns the current URL including protocol
		 *
		 * @method
		 * @return {String}
		 */
		getOrigin: function () {
			var origin = window.location.protocol + '//' + window.location.hostname;
			if ( window.location.port ) {
				origin += ':' + window.location.port;
			}
			return origin;
		}
	} );

	api = new Api();
	api.Api = Api;

	M.define( 'api', api );

}( mw.mobileFrontend, jQuery ) );
