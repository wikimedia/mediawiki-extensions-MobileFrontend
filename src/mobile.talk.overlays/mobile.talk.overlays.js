var m = require( './../mobile.startup/moduleLoaderSingleton' ),
	talkBoard = require( './talkBoard' ),
	TalkSectionAddOverlay = require( './TalkSectionAddOverlay' ),
	TalkSectionOverlay = require( './TalkSectionOverlay' );

m.define( 'mobile.talk.overlays/talkBoard', talkBoard );
m.define( 'mobile.talk.overlays/TalkSectionAddOverlay', TalkSectionAddOverlay );
m.define( 'mobile.talk.overlays/TalkSectionOverlay', TalkSectionOverlay );
