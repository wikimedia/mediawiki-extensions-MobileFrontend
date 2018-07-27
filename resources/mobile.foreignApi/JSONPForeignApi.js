( function ( M ) {
	var ForeignApi = mw.ForeignApi,
		util = M.require( 'mobile.startup/util' );

	/**
	 * Extends mw.ForeignApi to force it to use JSONP for non-POST requests
	 * @class JSONPForeignApi
	 * @extends mw.ForeignApi
	 *
	 * @param {string} url
	 * @param {Object} [options]
	 */
	function JSONPForeignApi( url, options ) {
		options = options || {};
		options.origin = undefined;
		ForeignApi.call( this, url, options );
		delete this.defaults.parameters.origin;
	}
	OO.inheritClass( JSONPForeignApi, ForeignApi );

	/**
	 * See https://doc.wikimedia.org/mediawiki-core/master/js/#!/api/mw.Api-method-ajax
	 * for inherited documentation.
	 * @memberof JSONPForeignApi
	 * @instance
	 * @param {Object} parameters
	 * @param {Object} [ajaxOptions]
	 * @return {jQuery.Promise}
	 */
	JSONPForeignApi.prototype.ajax = function ( parameters, ajaxOptions ) {
		if ( !ajaxOptions || ajaxOptions.type !== 'POST' ) {
			// optional parameter so may need to define it.
			ajaxOptions = ajaxOptions || {};
			// Fire jsonp where it can be.
			ajaxOptions.dataType = 'jsonp';
			// explicitly avoid requesting central auth tokens
			parameters = util.extend( {}, parameters, {
				centralauthtoken: false
			} );
		}
		return ForeignApi.prototype.ajax.call( this, parameters, ajaxOptions );
	};

	M.define( 'mobile.foreignApi/JSONPForeignApi', JSONPForeignApi );

}( mw.mobileFrontend ) );
