( function ( M, $ ) {
	var View = M.require( 'View' ),
		Icon = M.require( 'Icon' ),
		photoIcon = new Icon( {
			name: 'photo',
			hasText: true,
			additionalClassNames: 'mw-ui-progressive mw-ui-button button'
		} ),
		PhotoUploaderButton;

	/**
	 * Check whether photo upload is supported
	 * FIXME: Move to Browser.js
	 * @method
	 * @ignore
	 * @returns {Boolean}
	 */
	function isSupported() {
		// FIXME: create a module for browser detection stuff
		// deal with known false positives which don't support file input (bug 47374)
		if ( navigator.userAgent.match( /Windows Phone (OS 7|8.0)/ ) ) {
			return false;
		}
		var browserSupported = (
			typeof FileReader !== 'undefined' &&
			typeof FormData !== 'undefined' &&
			( $( '<input type="file"/>' ).prop( 'type' ) === 'file' ) // Firefox OS 1.0 turns <input type="file"> into <input type="text">
		);

		return browserSupported && !mw.config.get( 'wgImagesDisabled', false );
	}

	/**
	 * @class PhotoUploaderButton
	 * @extends View
	 * @uses Icon
	 * PhotoUploaderButton is a component for uploading images to the wiki.
	 *
	 *     @example
	 *     <code>
	 *     var photoUploaderButton = new PhotoUploaderButton( {
	 *         buttonCaption: 'Add a photo',
	 *     } );
	 *     photoUploaderButton.
	 *         insertAfter( 'h1' ).
	 *         on( 'upload', function ( fileName, url ) {
	 *             $( '.someImage' ).attr( 'src', url );
	 *         } );
	 *     </code>
	 *
	 * @param {Object} options Uploader options.
	 * @param {String} options.buttonCaption Caption for the upload button.
	 * @param {Boolean} options.insertInPage If the image should be prepended
	 * to the wikitext of a page specified by options.pageTitle.
	 * @param {String} options.pageTitle Title of the page to which the image
	 * belongs (image name will be based on this) and to which it should be
	 * prepended (if options.insertInPage is true).
	 * @param {String} options.funnel Funnel for EventLogging.
	 */
	PhotoUploaderButton = View.extend( {
		template: mw.template.get( 'mobile.upload.ui', 'Button.hogan' ),
		className: photoIcon.getClassName(),

		/** @inheritdoc */
		postRender: function () {
			var self = this,
				$input = this.$( 'input' );

			/**
			 * Hacky way to open a preview overlay with a certain image
			 * FIXME: Ideally the upload-preview URI should feature a representation of the image
			 * that can be used to create the upload overlay.
			 * @ignore
			 */
			function handleFile( file ) {
				/*
				 * @event _upload-preview
				 * Emitted when a user has selected a file of their local machine
				 */
				M.emit( '_upload-preview', file );
				M.router.navigate( '#/upload-preview/' + self.options.funnel );
			}

			$input
				.on( 'change', function () {
					handleFile( $input[0].files[0] );
					// clear so that change event is fired again when user selects the same file
					$input.val( '' );
				} );
		}
	} );

	PhotoUploaderButton.isSupported = isSupported();

	M.define( 'modules/uploads/PhotoUploaderButton', PhotoUploaderButton );

}( mw.mobileFrontend, jQuery ) );
