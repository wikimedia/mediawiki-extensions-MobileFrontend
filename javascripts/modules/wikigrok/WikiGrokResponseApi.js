// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
( function ( M ) {
	var WikiGrokResponseApi,
		context = M.require( 'context' ),
		user = M.require( 'user' ),
		ForeignApi = M.require( 'modules/ForeignApi' ),
		endpoint = mw.config.get( 'wgMFWikiDataEndpoint' );

	/**
	 * Record claims to the WikiGrok API
	 * @class WikiGrokApi
	 * @extends Api
	 */
	WikiGrokResponseApi = ForeignApi.extend( {
		apiUrl: endpoint,
		/**
		 * Initialize with default values
		 * @method
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			this.subjectId = options.itemId;
			this.subject = options.subject;
			this.userToken = options.userToken;
			this.taskToken = options.taskToken;
			this.taskType = 'version ' + options.version;
			this.testing = false;
			ForeignApi.prototype.initialize.apply( this, arguments );
		},
		/**
		 * Saves claims to the wikigrok API server
		 * @method
		 * @param {Array} claims A list of claims. Each claim must have correct, prop, propid, value and valueid set
		 * @return {jQuery.Deferred} Object returned by ajax call
		 */
		recordClaims: function ( claims ) {
			var data = {
				action: 'wikigrokresponse',
				page_id: mw.config.get( 'wgArticleId' ),
				user_token: this.userToken,
				task_token: this.taskToken,
				task_type: this.taskType,
				subject_id: this.subjectId,
				subject: this.subject,
				mobile_mode: context.getMode(),
				testing: this.testing,
				claims: JSON.stringify( claims ),
				wiki: mw.config.get( 'wgDBname' )
			};
			// To ensure that logged in users' requests don't get recorded as anonymous due to
			// CentralAuth problems, responses of users who are logged in locally should have
			// assert=user.
			if ( !user.isAnon() ) {
				data.assert = 'user';
			}
			return this.postWithToken( 'csrf', data );
		}
	} );
	M.define( 'modules/wikigrok/WikiGrokResponseApi', WikiGrokResponseApi );

}( mw.mobileFrontend ) );
