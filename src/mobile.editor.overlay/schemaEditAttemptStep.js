module.exports = function () {
	var trackdebug = !!mw.util.getParamValue( 'trackdebug' );

	if ( mw.loader.getState( 'schema.EditAttemptStep' ) === null && !trackdebug ) {
		return;
	}

	mw.loader.using( [ 'ext.eventLogging.subscriber' ] ).then( function () {
		var // Schema provided by ext.eventLogging.subscriber class
			Schema = mw.eventLog.Schema,
			user = mw.user,
			sampleRate = mw.config.get( 'wgWMESchemaEditAttemptStepSamplingRate' ),
			actionPrefixMap = {
				saveIntent: 'save_intent',
				saveAttempt: 'save_attempt',
				saveSuccess: 'save_success',
				saveFailure: 'save_failure'
			},
			timing = {},
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
					page_token: user.getPageviewToken(),
					session_token: user.sessionId(),
					version: 1
				}
			);
			/* eslint-enable camelcase */

		function log() {
			// mw.log is a no-op unless resource loader is in debug mode, so
			// this allows trackdebug to work independently (T211698)
			// eslint-disable-next-line no-console
			console.log.apply( console, arguments );
		}

		function computeDuration( action, event, timeStamp ) {
			// This is duplicated from the VisualEditor extension
			// (ve.init.mw.trackSubscriber.js). Changes to this should be kept in
			// sync with that file, so the data remains consistent.
			if ( event.timing !== undefined ) {
				return event.timing;
			}

			switch ( action ) {
				case 'ready':
					return timeStamp - timing.init;
				case 'loaded':
					return timeStamp - timing.init;
				case 'saveIntent':
					return timeStamp - timing.ready;
				case 'saveAttempt':
					return timeStamp - timing.saveIntent;
				case 'saveSuccess':
				case 'saveFailure':
					// HERE BE DRAGONS: the caller must compute these themselves
					// for sensible results. Deliberately sabotage any attempts to
					// use the default by returning -1
					mw.log.warn( 'mf.schemaEditAttemptStep: Do not rely on default timing value for saveSuccess/saveFailure' );
					return -1;
				case 'abort':
					switch ( event.abort_type ) {
						case 'preinit':
							return timeStamp - timing.init;
						case 'nochange':
						case 'switchwith':
						case 'switchwithout':
						case 'switchnochange':
						case 'abandon':
							return timeStamp - timing.ready;
						case 'abandonMidsave':
							return timeStamp - timing.saveAttempt;
					}
					mw.log.warn( 'mf.schemaEditAttemptStep: Unrecognized abort type', event.type );
					return -1;
			}
			mw.log.warn( 'mf.schemaEditAttemptStep: Unrecognized action', action );
			return -1;
		}

		mw.trackSubscribe( 'mf.schemaEditAttemptStep', function ( topic, data, timeStamp ) {
			var actionPrefix = actionPrefixMap[ data.action ] || data.action,
				duration = 0;

			timeStamp = timeStamp || this.timeStamp; // I8e82acc12 back-compat

			data[actionPrefix + '_type'] = data.type;
			data[actionPrefix + '_mechanism'] = data.mechanism;
			if ( data.action !== 'init' ) {
				duration = Math.round( computeDuration( data.action, data, timeStamp ) );
				data[actionPrefix + '_timing'] = duration;
			}

			// Remove renamed properties
			delete data.type;
			delete data.mechanism;
			data[actionPrefix + '_message'] = data.message;
			delete data.message;
			// eslint-disable-next-line camelcase
			data.is_oversample =
				!mw.eventLog.inSample( 1 / sampleRate );

			if ( data.action === 'abort' && data.abort_type !== 'switchnochange' ) {
				timing = {};
			} else {
				timing[ data.action ] = timeStamp;
			}

			// Switching between visual and source produces a chain of
			// abort/ready events and no init event, so suppress them for
			// consistency with desktop VE's logging.
			if ( data.abort_type === 'switchnochange' ) {
				return;
			}
			if ( timing.abort && data.action === 'ready' ) {
				delete timing.abort;
				return;
			}

			if ( trackdebug ) {
				log( topic + '.' + data.action, duration + 'ms', data );
			} else {
				schemaEditAttemptStep.log( data, (
					mw.config.get( 'wgWMESchemaEditAttemptStepOversample' ) ||
					mw.config.get( 'wgMFSchemaEditAttemptStepOversample' ) === 'all' ||
					// wikitext / visualeditor
					data.editor_interface === mw.config.get( 'wgMFSchemaEditAttemptStepOversample' )
				) ? 1 : sampleRate );
			}
		} );

	} );
};
