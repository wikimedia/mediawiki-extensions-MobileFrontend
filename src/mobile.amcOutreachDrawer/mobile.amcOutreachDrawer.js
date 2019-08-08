const
	m = require( '../mobile.startup/moduleLoaderSingleton' ),
	amcOutreachDrawer = require( './amcOutreachDrawer' );

// Needed for lazy loading
m.define( 'mobile.amcOutreachDrawer', {
	amcOutreachDrawer: amcOutreachDrawer
} );
