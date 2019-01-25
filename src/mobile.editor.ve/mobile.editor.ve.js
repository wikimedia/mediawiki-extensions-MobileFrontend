/* global ve */
var MobileFrontendArticleTarget = require( './ve.init.mw.MobileFrontendArticleTarget' ),
	schemaVisualEditorFeatureUse = require( './schemaVisualEditorFeatureUse' );

// register
ve.init.mw.MobileFrontendArticleTarget = MobileFrontendArticleTarget;
ve.init.mw.targetFactory.register( MobileFrontendArticleTarget );
schemaVisualEditorFeatureUse();
// Hook up activity-tracking from VE's system to mobilefrontend's system
ve.trackSubscribe( 'activity.', function ( topic, data ) {
	mw.track( 'mf.schemaVisualEditorFeatureUse', ve.extendObject( data, {
		feature: topic.split( '.' )[ 1 ],
		// eslint-disable-next-line camelcase
		editing_session_id: ve.init.target.overlay.sessionId
	} ) );
} );
