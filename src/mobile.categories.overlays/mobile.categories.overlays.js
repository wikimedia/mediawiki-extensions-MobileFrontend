var m = require( '../mobile.startup/moduleLoaderSingleton' ),
	CategoryAddOverlay = require( './CategoryAddOverlay' ),
	categoryOverlay = require( './categoryOverlay' );

// needed for minerva usages
m.define( 'mobile.categories.overlays/CategoryAddOverlay', CategoryAddOverlay );
m.define( 'mobile.categories.overlays/categoryOverlay', categoryOverlay );
m.deprecate( 'mobile.categories.overlays/CategoryOverlay', categoryOverlay,
	'mobile.categories.overlays/categoryOverlay' );
