/* global ve */
var schemaVisualEditorFeatureUse = require( './schemaVisualEditorFeatureUse' );

// FIXME Remove this
ve.init.mw.MobileArticleTarget.static.parseSaveError = function ( data ) {
	return data;
};

schemaVisualEditorFeatureUse();
// Hook up activity-tracking from VE's system to mobilefrontend's system
ve.trackSubscribe( 'activity.', function ( topic, data ) {
	mw.track( 'mf.schemaVisualEditorFeatureUse', ve.extendObject( data, {
		feature: topic.split( '.' )[ 1 ],
		// eslint-disable-next-line camelcase
		editing_session_id: ve.init.target.overlay.sessionId
	} ) );
} );
