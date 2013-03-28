( function( M, $ ) {

	var nav = M.require( 'navigation' ),
		TalkOverlay = nav.Overlay.extend( {
			template: M.template.get( 'overlays/talk' )
		} ),
		talkPage = 'Talk:' + mw.config.get( 'wgTitle' ),
		Page = M.require( 'page'),
		$talk = $( '#talk' ),
		req,
		api = M.require( 'api' );

	$talk.on( 'click', function( ev ) {
		// FIXME: this currently gives an indication something async is happening. We can do better.
		$talk.css( 'opacity', 0.2 );
		ev.preventDefault();
		req = req || api.get( {
			action: 'mobileview', page: talkPage,
			variant: mw.config.get( 'wgPreferredVariant' ),
			prop: 'sections|text', noheadings: 'yes',
			noimages: mw.config.get( 'wgImagesDisabled', false ) ? 1 : undefined,
			sectionprop: 'level|line|anchor', sections: 'all'
		} );
		req.done( function( resp ) {
			var topOverlay, sections, page,
				explanation;

			if ( resp.error ) {
				// page doesn't exist
				page = new Page( { sections: {} } );
			} else {
				page = new Page( { sections: resp.mobileview.sections } );
			}

			$talk.css( 'opacity', '' );
			sections = page.getSubSections();
			explanation = sections.length > 0 ? mw.msg( 'mobile-frontend-talk-explained' ) :
				mw.msg( 'mobile-frontend-talk-explained-empty' );
			topOverlay = new TalkOverlay( {
				heading: mw.msg( 'mobile-frontend-talk-overlay-header' ),
				explanation: explanation,
				sections: sections
			} );
			topOverlay.show();
			topOverlay.$( 'a' ).on( 'click', function() {
				var
					section = page.getSubSection( parseInt( $( this ).data( 'id' ), 10 ) ),
					childOverlay = new nav.Overlay( {
						content: M.template.get( 'talkSection' ).render( section ),
						parent: topOverlay
					} );
				childOverlay.show();
			} );
		} ).error( function() {
			$talk.css( 'opacity', '' );
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
