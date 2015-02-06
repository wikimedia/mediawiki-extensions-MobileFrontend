( function ( M ) {
	var InfoOverlay,
		mainMenu = M.require( 'skin' ).getMainMenu(),
		Icon = M.require( 'Icon' ),
		Overlay = M.require( 'Overlay' ),
		wikiGrokRoulette = M.require( 'modules/wikiGrokRoulette/wikiGrokRoulette' );

	/**
	 * Displays WikiGrokRoulette info
	 * @class InfoOverlay
	 * @extends Overlay
	 * @uses Icon
	 */
	InfoOverlay = Overlay.extend( {
		className: 'overlay wikigrok-roulette-info-overlay',
		/**
		 * @inheritdoc
		 */
		template: mw.template.get( 'mobile.wikigrok.roulette', 'InfoOverlay.hogan' ),
		/**
		 * @inheritdoc
		 */
		defaults: {
			hamburgerIcon: new Icon( {
				additionalClassNames: 'mainmenu',
				name: 'mainmenu',
				label: mw.msg( 'mobile-frontend-main-menu-button-tooltip' ),
				title:  mw.msg( 'mobile-frontend-main-menu-button-tooltip' )
			} ).toHtmlString(),
			titleMsg: mw.msg( 'mobile-frontend-wikigrok-roulette-info-overlay-title' ),
			contentMsg: mw.msg( 'mobile-frontend-wikigrok-roulette-info-overlay-content' ),
			startBtnLbl: mw.msg( 'mobile-frontend-wikigrok-roulette-info-overlay-start-button-label' )
		},
		/**
		 * @inheritdoc
		 */
		events: {
			'click .mainmenu': 'onClickMainMenu',
			'click .lets-go': 'onClickLetsGo'
		},
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			// Silently fetch the next page
			wikiGrokRoulette.getNextPage();
		},
		/**
		 * Hide the info and show the navigation drawer
		 */
		onClickMainMenu: function () {
			this.hide();
			mainMenu.openNavigationDrawer( '' );
			this.detach();
		},
		/**
		 * Navigate to the next page that has a wikigrok campaign.
		 * Also remember that the user has seen this info.
		 */
		onClickLetsGo: function () {
			// remember so that we don't show this the next time
			localStorage.setItem( 'hasWikiGrokRouletteInfoBeenShown', '1' );
			wikiGrokRoulette.navigateToNextPage();
		}
	} );

	M.define( 'modules/wikiGrokRoulette/InfoOverlay', InfoOverlay );
}( mw.mobileFrontend ) );
