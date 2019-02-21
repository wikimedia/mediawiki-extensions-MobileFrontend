var m = require( './../mobile.startup/moduleLoaderSingleton' ),
	talkBoard = require( './talkBoard' ),
	overlay = require( '../mobile.startup/talk/overlay' ),
	PageGateway = require( '../mobile.startup/PageGateway' ),
	TalkSectionAddOverlay = require( './TalkSectionAddOverlay' ),
	TalkSectionOverlay = require( './TalkSectionOverlay' );

/**
 * Backwards compatible method for obtaining a TalkOverlay
 * used by Minerva until it updates itself.
 * @deprecated
 * @param {Object} options
 * @return {Overlay}
 */
function talkOverlay( options ) {
	return overlay( options.title, new PageGateway( options.api ) );
}

m.deprecate( 'mobile.talk.overlays/talkOverlay', talkOverlay,
	'Use `mobile.startup` (talk.overlay)' );
m.define( 'mobile.talk.overlays/talkBoard', talkBoard );
m.define( 'mobile.talk.overlays/TalkSectionAddOverlay', TalkSectionAddOverlay );
m.define( 'mobile.talk.overlays/TalkSectionOverlay', TalkSectionOverlay ); // resource-modules-disable-line
