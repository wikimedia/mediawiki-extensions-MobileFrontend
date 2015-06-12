( function ( M, $ ) {
	var inSample, inStable,
		settings = M.require( 'settings' ),
		token = settings.get( 'mobile-betaoptin-token' ),
		BetaOptinPanel = M.require( 'mobile.betaoptin/BetaOptinPanel' ),
		loader = M.require( 'loader' ),
		router = M.require( 'router' ),
		context = M.require( 'context' ),
		useNewMediaViewer = context.isAlphaGroupMember(),
		overlayManager = M.require( 'overlayManager' ),
		page = M.getCurrentPage(),
		pageApi = M.require( 'pageApi' ),
		MobileWebClickTracking = M.require( 'loggingSchemas/SchemaMobileWebClickTracking' ),
		uiSchema = new MobileWebClickTracking( {}, 'MobileWebUIClickTracking' ),
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
	function initMediaViewer() {
		if ( !mw.config.get( 'wgImagesDisabled' ) ) {
			$.each( thumbs, function ( i, thumb ) {
				thumb.$el.off().data( 'thumb', thumb ).on( 'click', onClickImage );
			} );
		}
	}

	/**
	 * Hijack the Special:Languages link and replace it with a trigger to a LanguageOverlay
	 * that displays the same data
	 * @ignore
	 */
	function initButton() {
		$( '#page-secondary-actions .languageSelector' ).on( 'click', function ( ev ) {
			ev.preventDefault();
			router.navigate( '/languages' );
			uiSchema.log( {
				name: 'languages'
			} );
		} );
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

	// Routes
	overlayManager.add( /^\/media\/(.+)$/, loadImageOverlay );
	overlayManager.add( /^\/languages$/, function () {
		var result = $.Deferred();

		loader.loadModule( 'mobile.languages', true ).done( function ( loadingOverlay ) {
			var LanguageOverlay = M.require( 'modules/languages/LanguageOverlay' );

			pageApi.getPageLanguages( mw.config.get( 'wgPageName' ) ).done( function ( data ) {
				loadingOverlay.hide();
				result.resolve( new LanguageOverlay( {
					languages: data.languages,
					variants: data.variants
				} ) );
			} );
		} );
		return result;
	} );

	// for Special:Uploads
	M.on( 'photo-loaded', initMediaViewer );

	// Setup
	$( initButton );
	initMediaViewer();

	// local storage is supported in this case, when ~ means it was dismissed
	if ( token !== false && token !== '~' && !page.isMainPage() && !page.inNamespace( 'special' ) ) {
		if ( !token ) {
			token = mw.user.generateRandomSessionId();
			settings.save( 'mobile-betaoptin-token', token );
		}

		inStable = !context.isBetaGroupMember();
		// a single character has 16 possibilities so this is 1/16 6.25% chance (a-f and 0-9)
		// 3% chance of this happening
		inSample = $.inArray( token.charAt( 0 ), [ '3' ] ) !== -1;
		if ( inStable && ( inSample || mw.util.getParamValue( 'debug' ) ) ) {
			new BetaOptinPanel()
				.on( 'hide', function () {
					settings.save( 'mobile-betaoptin-token', '~' );
				} )
				.appendTo( M.getCurrentPage().getLeadSectionElement() );
		}
	}

}( mw.mobileFrontend, jQuery ) );
