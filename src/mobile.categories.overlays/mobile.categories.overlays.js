var m = require( '../mobile.startup/moduleLoaderSingleton' ),
	CategoryAddOverlay = require( './CategoryAddOverlay' ),
	CategoryTabs = require( './CategoryTabs' );

m.define( 'mobile.categories.overlays', {
	CategoryTabs,
	CategoryAddOverlay
} );
