// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
( function ( M ) {
	var WikiGrokResponseApi,
		Api = M.require( 'api' ).Api;

	/**
	 * Record claims to the WikiGrok api
	 * @class WikiGrokApi
	 */
	WikiGrokResponseApi = Api.extend( {

		initialize: function ( options ) {
			this.subjectId = options.itemId;
			this.subject = options.subject;
			this.userToken = options.userToken;
			this.taskToken = options.taskToken;
			this.taskType = 'version ' + options.version;
			this.testing = false;  // FIXME: TBD on what qualifies as a test
			Api.prototype.initialize.apply( this, arguments );
		},
		/**
		 * Saves claims to the wikigrok api server
		 * @method
		 * @param {Array} claims a list of claims. Each claim must have correct, prop, propid, value and valueid set
		 * @return {jQuery.Deferred}
		 */
		recordClaims: function ( claims ) {
			return this.postWithToken( 'edit', {
				action: 'wikigrokresponse',
				page_id: mw.config.get( 'wgArticleId' ),
				user_token: this.userToken,
				task_token: this.taskToken,
				task_type: this.taskType,
				subject_id: this.subjectId,
				subject: this.subject,
				mobile_mode: M.getMode(),
				testing: this.testing,
				claims: JSON.stringify( claims )
			} );
		}
	} );
	M.define( 'modules/wikigrok/WikiGrokResponseApi', WikiGrokResponseApi );

}( mw.mobileFrontend ) );
