/* global ve */

// Hook up activity-tracking from VE's system to mobilefrontend's system
ve.trackSubscribe( 'activity.', function ( topic, data ) {
	// Events may get fired as the target is tearing down, in which
	// it may not still exist by the time this runs (e.g. auto-closing
	// any still-open dialogs). These events are probably not important.
	if ( ve.init.target ) {
		ve.init.target.overlay.logFeatureUse( ve.extendObject( data, {
			feature: topic.split( '.' )[ 1 ]
		} ) );
	}
} );
