module.exports = function () {
	var trackdebug = !!mw.util.getParamValue( 'trackdebug' );

	if ( !mw.config.exists( 'wgWMESchemaEditAttemptStepSamplingRate' ) ) {
		return;
	}

	// VisualEditorFeatureUse is intended to log whenever EditAttemptStep
	// does, so this file references its config for sampling rates and
	// oversampling.

	mw.loader.using( [ 'ext.eventLogging' ] ).then( function () {
		var // Schema class provided by ext.eventLogging
			Schema = mw.eventLog.Schema,
			sampleRate = mw.config.get( 'wgWMESchemaEditAttemptStepSamplingRate' ),
			/**
			 * Feature use schema
			 * https://meta.wikimedia.org/wiki/Schema:VisualEditorFeatureUse
			 */
			schemaVisualEditorFeatureUse = new Schema(
				'VisualEditorFeatureUse',
				sampleRate
			);

		function log() {
			// mw.log is a no-op unless resource loader is in debug mode, so
			// this allows trackdebug to work independently (T211698)
			// eslint-disable-next-line no-console
			console.log.apply( console, arguments );
		}

		mw.trackSubscribe( 'mf.schemaVisualEditorFeatureUse', function ( topic, data ) {
			var event = {
				feature: data.feature,
				action: data.action,
				editingSessionId: data.editing_session_id
			};

			if ( trackdebug ) {
				log( topic, event );
			} else {
				schemaVisualEditorFeatureUse.log( event, (
					mw.config.get( 'wgWMESchemaEditAttemptStepOversample' ) ||
					mw.config.get( 'wgMFSchemaEditAttemptStepOversample' ) === 'visualeditor' ||
					mw.config.get( 'wgMFSchemaEditAttemptStepOversample' ) === 'all'
				) ? 1 : sampleRate );
			}
		} );

	} );
};
