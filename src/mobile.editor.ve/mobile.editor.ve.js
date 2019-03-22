/* global ve */
var schemaVisualEditorFeatureUse = require( './schemaVisualEditorFeatureUse' );

// FIXME Figure out a way to make this method public on some other class,
// so that VisualEditor can call it without us overriding it like this
ve.init.mw.MobileArticleTarget.static.parseSaveError =
	require( '../mobile.editor.overlay/parseSaveError' );

schemaVisualEditorFeatureUse();
// Hook up activity-tracking from VE's system to mobilefrontend's system
ve.trackSubscribe( 'activity.', function ( topic, data ) {
	mw.track( 'mf.schemaVisualEditorFeatureUse', ve.extendObject( data, {
		feature: topic.split( '.' )[ 1 ],
		// eslint-disable-next-line camelcase
		editing_session_id: ve.init.target.overlay.sessionId
	} ) );
} );
