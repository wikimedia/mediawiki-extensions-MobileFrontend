var m = require( '../mobile.startup/moduleLoaderSingleton' ),
	CategoryAddOverlay = require( './CategoryAddOverlay' ),
	CategoryTabs = require( './CategoryTabs' ),
	categoryOverlay = require( '../mobile.startup/categoryOverlay' );

// needed for minerva usages
m.deprecate( 'mobile.categories.overlays/CategoryAddOverlay', CategoryAddOverlay,
	'Use `mobile.categories.overlays`'
);
m.deprecate( 'mobile.categories.overlays/categoryOverlay', categoryOverlay,
	'Use `mobile.categories.overlays`'
);

m.define( 'mobile.categories.overlays', {
	CategoryTabs,
	CategoryAddOverlay
} );
