( function ( M, $ ) {

	var loader = M.require( 'loader' ),
		Button = M.require( 'Button' ),
		overlayManager = M.require( 'overlayManager' ),
		wbId = M.require( 'util' ).getWikiBaseItemId();

	if ( wbId ) {
		overlayManager.add( /^\/other-projects$/, function () {
			var result = $.Deferred();

			loader.loadModule( 'mobile.otherProjects', true ).done( function ( loadingOverlay ) {
				var OtherProjectsOverlay = M.require( 'modules/projects/OtherProjectsOverlay' ),
					WikiDataApi = M.require( 'modules/WikiDataApi' ),
					api = new WikiDataApi( {
						itemId: wbId
					} );

				api.getSiteLinks().done( function ( siteLinks ) {
					loadingOverlay.hide();
					result.resolve( new OtherProjectsOverlay( {
						links: siteLinks
					} ) );
				} );
			} );
			return result;
		} );

		// Add the button
		new Button( {
			label: mw.msg( 'mobile-frontend-other-project-label' ),
			href: '#/other-projects'
		} ).appendTo( '#page-secondary-actions' );
	}

}( mw.mobileFrontend, jQuery ) );
