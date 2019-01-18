var m = require( './../mobile.startup/moduleLoaderSingleton' ),
	talkOverlay = require( './talkOverlay' ),
	TalkSectionAddOverlay = require( './TalkSectionAddOverlay' ),
	TalkSectionOverlay = require( './TalkSectionOverlay' );

// needed for minerva usages
m.define( 'mobile.talk.overlays/talkOverlay', talkOverlay );
m.deprecate( 'mobile.talk.overlays/TalkOverlay', talkOverlay,
	'mobile.talk.overlays/talkOverlay' );
m.define( 'mobile.talk.overlays/TalkSectionAddOverlay', TalkSectionAddOverlay );
m.define( 'mobile.talk.overlays/TalkSectionOverlay', TalkSectionOverlay ); // resource-modules-disable-line
