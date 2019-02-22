var talkBoard = require( './talkBoard' ),
	PageGateway = require( '../mobile.startup/PageGateway' ),
	promisedView = require( '../mobile.startup/promisedView' ),
	Anchor = require( '../mobile.startup/Anchor' ),
	Overlay = require( '../mobile.startup/Overlay' );

/**
 * Produce an overlay for talk page
 * @uses Overlay
 * @param {Object} options
 * @param {Api} options.api
 * @param {string} options.title of the page to get talk topics for
 * @return {Overlay}
 */
function talkOverlay( options ) {
	var title = options.title,
		user = mw.user,
		gateway = new PageGateway( options.api );

	return Overlay.make(
		{
			heading: '<strong>' + mw.msg( 'mobile-frontend-talk-overlay-header' ) + '</strong>',
			headerButtonsListClassName: 'header-action',
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
			gateway.getSections( title ).then( function ( sections ) {
				return talkBoard( sections );
			} )
		)
	);
}

module.exports = talkOverlay;
