module.exports = function () {
	var trackdebug = !!mw.util.getParamValue( 'trackdebug' );

	if ( mw.loader.getState( 'schema.VisualEditorFeatureUse' ) === null && !trackdebug ) {
		return;
	}

	// VisualEditorFeatureUse is intended to log whenever EditAttemptStep
	// does, so this file references its config for sampling rates and
	// oversampling.

	mw.loader.using( [ 'ext.eventLogging.subscriber' ] ).then( function () {
		var // Schema provided by ext.eventLogging.subscriber class
			Schema = mw.eventLog.Schema, // resource-modules-disable-line
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
