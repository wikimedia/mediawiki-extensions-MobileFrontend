var m = require( '../moduleLoaderSingleton' ),
	promisedView = require( '../promisedView' ),
	Anchor = require( '../Anchor' ),
	util = require( '../util' ),
	Overlay = require( '../Overlay' );

/**
 * Produce an overlay for talk page
 * @param {string} title of the page to get talk topics for
 * @param {PageGateway} gateway for interacting with API.
 * @return {Overlay}
 */
function talkOverlay( title, gateway ) {
	var user = mw.user;

	return Overlay.make(
		{
			heading: '<strong>' + mw.msg( 'mobile-frontend-talk-overlay-header' ) + '</strong>',
			headerButtons: [ user.isAnon() ? {} : {
				href: '#/talk/new',
				className: 'continue',
				msg: mw.msg( 'mobile-frontend-talk-add-overlay-submit' )
			} ],
			footerAnchor: new Anchor( {
				progressive: true,
				href: mw.util.getUrl( title ),
				additionalClassNames: 'footer-link talk-fullpage',
				label: mw.msg( 'mobile-frontend-talk-fullpage' )
			} ).options,
			className: 'talk-overlay overlay'
		},
		promisedView(
			util.Promise.all( [
				gateway.getSections( title ),
				mw.loader.using( 'mobile.talk.overlays' )
			] ).then( function ( sections ) {
				var talkBoard = m.require( 'mobile.talk.overlays/talkBoard' );
				return talkBoard( sections );
			} )
		)
	);
}

module.exports = talkOverlay;
