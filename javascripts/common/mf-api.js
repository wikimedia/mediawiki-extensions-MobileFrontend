( function( M, $ ) {

	var tokenCache = {};

	$.ajaxSetup( {
		url: M.getApiUrl(),
		dataType: 'json',
		data: {
			format: 'json'
		}
	} );

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
	function ajax( data, options ) {
		var key;
		options = $.extend( {}, options );

		for ( key in data ) {
			if ( data[key] === false ) {
				delete data[key];
			} else if ( data[key] instanceof Array ) {
				data[key] = data[key].join( '|' );
			}
		}
		options.data = data;

		return $.ajax( options );
	}

	/**
	 * A wrapper for $.ajax() to be used when calling server APIs.
	 * Sends a GET request. See ajax() for details.
	 *
	 * @param {Object} data Data to be preprocessed and added to options
	 * @param {Object} options Parameters passed to $.ajax()
	 * @return {jQuery.Deferred} Object returned by $.ajax()
	 */
	function get( data, options ) {
		options = $.extend( {}, options, { type: 'GET' } );
		return ajax( data, options );
	}

	/**
	 * A wrapper for $.ajax() to be used when calling server APIs.
	 * Sends a POST request. See ajax() for details.
	 *
	 * @param {Object} data Data to be preprocessed and added to options
	 * @param {Object} options Parameters passed to $.ajax()
	 * @return {jQuery.Deferred} Object returned by $.ajax()
	 */
	function post( data, options ) {
		options = $.extend( {}, options, { type: 'POST' } );
		return ajax( data, options );
	}

	function getToken( tokenType, callback, endpoint ) {
		var data;
		if ( !tokenCache[ endpoint ] ) {
			tokenCache[ endpoint ] = {};
		}
		if ( !M.isLoggedIn() ) {
			callback( {} ); // return no token
		} else if ( tokenCache[ endpoint ].hasOwnProperty( tokenType ) ) {
			tokenCache[ endpoint ][ tokenType ].done( callback );
		} else {
			data = {
				action: 'tokens',
				type: tokenType
			};
			if ( endpoint ) {
				data.origin = M.getOrigin();
			}
			tokenCache[ endpoint ][ tokenType ] = ajax( data, {
				url: endpoint || M.getApiUrl(),
				xhrFields: { 'withCredentials': true }
			} ).done( callback );
		}
	}

	M.define( 'api', {
		ajax: ajax,
		get: get,
		post: post,
		getToken: getToken
	} );

}( mw.mobileFrontend, jQuery ) );
