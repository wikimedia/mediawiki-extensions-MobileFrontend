( function ( M, $ ) {
	var loader = M.require( 'loader' ),
		router = M.require( 'router' ),
		context = M.require( 'context' ),
		useNewMediaViewer = context.isAlphaGroupMember(),
		overlayManager = M.require( 'overlayManager' ),
		page = M.getCurrentPage(),
		thumbs = page.getThumbnails();

	/**
	 * Event handler for clicking on an image thumbnail
	 * @param {jQuery.Event} ev
	 * @ignore
	 */
	function onClickImage( ev ) {
		ev.preventDefault();
		router.navigate( '#/media/' + $( this ).data( 'thumb' ).getFileName() );
	}

	/**
	 * Add routes to images and handle clicks
	 * @method
	 * @ignore
	 */
	function init() {
		if ( !mw.config.get( 'wgImagesDisabled' ) ) {
			$.each( thumbs, function ( i, thumb ) {
				thumb.$el.off().data( 'thumb', thumb ).on( 'click', onClickImage );
			} );
		}
	}

	/**
	 * Load image overlay
	 * @method
	 * @ignore
	 * @uses ImageOverlay
	 * @param {String} title Url of image
	 * @returns {jQuery.Deferred}
	 */
	function loadImageOverlay( title ) {
		var result = $.Deferred(),
			rlModuleName = useNewMediaViewer ? 'mobile.mediaViewer.beta' : 'mobile.mediaViewer',
			moduleName = useNewMediaViewer ? 'ImageOverlayNew' : 'ImageOverlay';

		loader.loadModule( rlModuleName ).done( function () {
			var ImageOverlay = M.require( 'modules/mediaViewer/' + moduleName );

			result.resolve(
				new ImageOverlay( {
					thumbnails: thumbs,
					title: decodeURIComponent( title )
				} )
			);
		} );
		return result;
	}

	overlayManager.add( /^\/media\/(.+)$/, loadImageOverlay );

	init();
	// for Special:Uploads
	M.on( 'photo-loaded', init );

}( mw.mobileFrontend, jQuery ) );
