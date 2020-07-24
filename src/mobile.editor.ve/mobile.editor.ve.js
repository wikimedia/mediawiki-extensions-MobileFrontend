/* global ve */

// Hook up activity-tracking from VE's system to mobilefrontend's system
ve.trackSubscribe( 'activity.', function ( topic, data ) {
	ve.init.target.overlay.logFeatureUse( ve.extendObject( data, {
		feature: topic.split( '.' )[ 1 ]
	} ) );
} );
