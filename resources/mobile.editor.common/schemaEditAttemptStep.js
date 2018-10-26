mw.loader.using( [ 'schema.EditAttemptStep', 'ext.eventLogging.subscriber' ] ).then( function () {
	var M = mw.mobileFrontend,
		// Schema provided by ext.eventLogging.subscriber class
		Schema = mw.eventLog.Schema, // resource-modules-disable-line
		user = M.require( 'mobile.startup/user' ),
		sampleRate = mw.config.get( 'wgWMESchemaEditAttemptStepSampleRate' ),
		actionPrefixMap = {
			saveIntent: 'save_intent',
			saveAttempt: 'save_attempt',
			saveSuccess: 'save_success',
			saveFailure: 'save_failure'
		},
		/**
		 * Edit schema
		 * https://meta.wikimedia.org/wiki/Schema:EditAttemptStep
		 */
		/* eslint-disable camelcase */
		schemaEditAttemptStep = new Schema(
			'EditAttemptStep',
			sampleRate,
			{
				page_id: mw.config.get( 'wgArticleId' ),
				revision_id: mw.config.get( 'wgRevisionId' ),
				page_title: mw.config.get( 'wgPageName' ),
				page_ns: mw.config.get( 'wgNamespaceNumber' ),
				user_id: user.getId(),
				user_class: user.isAnon() ? 'IP' : undefined,
				user_editcount: mw.config.get( 'wgUserEditCount', 0 ),
				mw_version: mw.config.get( 'wgVersion' ),
				platform: 'phone',
				integration: 'page',
				page_token: mw.user.getPageviewToken(),
				session_token: mw.user.sessionId(),
				version: 1
			}
		);
		/* eslint-enable camelcase */

	mw.trackSubscribe( 'mf.schemaEditAttemptStep', function ( topic, data ) {
		var actionPrefix = actionPrefixMap[ data.action ] || data.action;
		data[actionPrefix + '_type'] = data.type;
		delete data.type;
		data[actionPrefix + '_mechanism'] = data.mechanism;
		delete data.mechanism;
		// data[actionPrefix + '_timing'] = Math.round( computeDuration( ... ) );
		data[actionPrefix + '_message'] = data.message;
		delete data.message;
		// eslint-disable-next-line camelcase
		data.is_oversample =
			!mw.eventLog.inSample( 1 / sampleRate ); // resource-modules-disable-line

		schemaEditAttemptStep.log( data, mw.config.get( 'wgWMESchemaEditAttemptStepOversample' ) ? 1 : sampleRate );
	} );

} );
