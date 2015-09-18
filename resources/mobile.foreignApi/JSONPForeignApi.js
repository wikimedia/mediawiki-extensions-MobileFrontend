( function ( M, $ ) {
	/**
	 * Extends mw.ForeignApi to force it to use JSONP for non-POST requests
	 * @class JSONPForeignApi
	 * @extends mw.ForeignApi
	 */
	function JSONPForeignApi( endpoint, options ) {
		options = options || {};
		options.origin = undefined;
		mw.ForeignApi.call( this, endpoint, options );
		delete this.defaults.parameters.origin;
	}
	OO.inheritClass( JSONPForeignApi, mw.ForeignApi );

	/**
	 * See https://doc.wikimedia.org/mediawiki-core/master/js/#!/api/mw.Api-method-ajax
	 * for inherited documentation.
	 * @param {Object} data
	 * @param {Object} options
	 */
	JSONPForeignApi.prototype.ajax = function ( data, options ) {
		if ( !options || options.type !== 'POST' ) {
			// optional parameter so may need to define it.
			options = options || {};
			// Fire jsonp where it can be.
			options.dataType = 'jsonp';
			// explicitly avoid requesting central auth tokens
			data = $.extend( {}, data, {
				centralauthtoken: false
			} );
		}
		return mw.ForeignApi.prototype.ajax.call( this, data, options );
	};

	M.define( 'mobile.foreignApi/JSONPForeignApi', JSONPForeignApi );

}( mw.mobileFrontend, jQuery ) );
