/* global $ */

// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
/**
 * mobileFrontend namespace
 * @class mw.mobileFrontend
 * @singleton
 */
var skin,
	storage = mw.storage,
	toggling = require( './toggling' ),
	skinName = mw.config.get( 'skin' ),
	isPageContentModelEditable = mw.config.get( 'wgMFIsPageContentModelEditable' ),
	editor = require( './editor' ),
	currentPage = require( '../mobile.startup/currentPage' )(),
	currentPageHTMLParser = require( '../mobile.startup/currentPageHTMLParser' )(),
	BetaOptInPanel = require( './BetaOptInPanel' ),
	util = mw.util,
	mfUtil = require( '../mobile.startup/util' ),
	$window = mfUtil.getWindow(),
	$html = mfUtil.getDocument(),
	user = mw.user,
	context = require( '../mobile.startup/context' ),
	experiments = mw.experiments,
	activeExperiments = mw.config.get( 'wgMFExperiments' ) || {},
	Skin = require( '../mobile.startup/Skin' ),
	eventBus = require( '../mobile.startup/eventBusSingleton' ),
	amcOutreach = require( '../mobile.startup/amcOutreach/amcOutreach' );

skin = Skin.getSingleton();

/**
 * Given 2 functions, it returns a function that will run both with it's
 * context and parameters and return the results combined
 * @private
 * @param {Function} fn1
 * @param {Function} fn2
 * @return {Function} which returns the results of [fn1, fn2]
 */
function apply2( fn1, fn2 ) {
	return function () {
		return [
			fn1.apply( this, arguments ),
			fn2.apply( this, arguments )
		];
	};
}

/**
 * The `window`'s resize event debounced at 100 ms.
 * The `resize:throttled` event is the `window`'s
 * resize event throttled to 200 ms.
 * @event resize
 */

/**
 * The `window`'s scroll event debounced at 100 ms.
 * The `scroll:throttled` event is the `window`'s
 * scroll event throttled to 200 ms.
 * @event scroll
 */

$window
	.on( 'resize', apply2(
		$.debounce( 100, function () { eventBus.emit( 'resize' ); } ),
		$.throttle( 200, function () { eventBus.emit( 'resize:throttled' ); } )
	) )
	.on( 'scroll', apply2(
		$.debounce( 100, function () { eventBus.emit( 'scroll' ); } ),
		$.throttle( 200, function () { eventBus.emit( 'scroll:throttled' ); } )
	) );

/**
 * Displays a prompt to ask the user to join the mobile beta mode.
 *
 * @private
 * @param {Object} experiment sampling data
 * @param {Page} page
 * @param {PageHTMLParser} pageHTMLParser
 */
function displayBetaOptIn( experiment, page, pageHTMLParser ) {
	var betaOptInPanel, inStable, inSample,
		token = storage.get( 'mobile-betaoptin-token' );

	// local storage is supported in this case, when ~ means it was dismissed
	if ( token !== false && token !== '~' &&
		!page.isMainPage() && !page.inNamespace( 'special' )
	) {
		if ( !token ) {
			token = user.generateRandomSessionId();
			storage.set( 'mobile-betaoptin-token', token );
		}

		inStable = context.getMode() === 'stable';
		inSample = experiments.getBucket( experiment, token ) === 'A';
		if ( inStable && ( inSample || util.getParamValue( 'debug' ) ) ) {
			betaOptInPanel = new BetaOptInPanel( {
				postUrl: util.getUrl( 'Special:MobileOptions', {
					returnto: page.title
				} ),
				onCancel: function ( ev ) {
					ev.preventDefault();
					storage.set( 'mobile-betaoptin-token', '~' );
					this.remove();
				}
			} );

			betaOptInPanel.appendTo( pageHTMLParser.getLeadSectionElement() );
		}

		// let the interested parties e.g. QuickSurveys know whether the panel is shown
		mw.track( 'mobile.betaoptin', {
			isPanelShown: betaOptInPanel !== undefined
		} );
	}
}

/**
 * Updates the font size based on the current value in storage
 */
function updateFontSize() {
	// FIXME: Ideally 'regular' would come from a shared constant
	// (currently not possible without using webpack)
	var userFontSize = storage.get( 'userFontSize', 'regular' );
	$html.addClass( 'mf-font-size-' + userFontSize );
}

// Font must be updated on back button press as users may click
// back after changing font.
$window.on( 'pageshow', function () {
	updateFontSize();
} );
updateFontSize();

if ( activeExperiments.betaoptin ) {
	displayBetaOptIn( activeExperiments.betaoptin, currentPage, currentPageHTMLParser );
}

mw.requestIdleCallback( function () {
	const amcCampaign = amcOutreach.loadCampaign();
	amcCampaign.showIfEligible( amcOutreach.ACTIONS.onLoad );
} );

// Recruit volunteers through the console
// (note console.log may not be a function so check via apply)
/* eslint-disable no-console */
if ( window.console && window.console.log && window.console.log.apply &&
		mw.config.get( 'wgMFEnableJSConsoleRecruitment' ) ) {
	console.log( mw.msg( 'mobile-frontend-console-recruit' ) );
}
/* eslint-enable no-console */

// setup editor
if ( !currentPage.inNamespace( 'special' ) && isPageContentModelEditable ) {
	// TODO: Mobile editor doesn't work well with other skins yet (it looks horribly broken
	// without some styles that are only defined by Minerva).
	if ( skinName === 'minerva' ) {
		// TODO: This code should not even be loaded on desktop.
		// Remove this check when that is fixed (T216537).
		if ( context.getMode() !== null ) {
			editor( currentPage, currentPageHTMLParser, skin );
		}
	}
}

toggling();

mw.mobileFrontend.deprecate( 'mobile.init/skin', skin,
	'instance of mobile.startup/Skin. Minerva should have no dependencies on mobile.init' );
