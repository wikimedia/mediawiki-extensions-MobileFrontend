( function( M, $ ) {
	var View = M.require( 'View' ),
		LoadingOverlay = M.require( 'LoadingOverlayNew' ),
		PhotoUploaderButton;

	function isSupported() {
		// FIXME: create a module for browser detection stuff
		// deal with known false positives which don't support file input (bug 47374)
		if ( navigator.userAgent.match( /Windows Phone (OS 7|8.0)/ ) ) {
			return false;
		}
		var browserSupported = (
			typeof FileReader !== 'undefined' &&
			typeof FormData !== 'undefined' &&
			($('<input type="file"/>').prop('type') === 'file') // Firefox OS 1.0 turns <input type="file"> into <input type="text">
		);

		return browserSupported && !mw.config.get( 'wgImagesDisabled', false );
	}

	/**
	 * PhotoUploaderButton is a component for uploading images to the wiki.
	 *
	 * @example
	 * <code>
	 * var photoUploaderButton = new PhotoUploaderButton( {
	 *     buttonCaption: 'Add a photo',
	 * } );
	 * photoUploaderButton.
	 *     insertAfter( 'h1' ).
	 *     on( 'upload', function( fileName, url ) {
	 *         $( '.someImage' ).attr( 'src', url );
	 *     } );
	 * </code>
	 *
	 * @constructor
	 * @param {Object} options Uploader options.
	 * @param {string} options.buttonCaption Caption for the upload button.
	 * @param {boolean} options.insertInPage If the image should be prepended
	 * to the wikitext of a page specified by options.pageTitle.
	 * @param {string} options.pageTitle Title of the page to which the image
	 * belongs (image name will be based on this) and to which it should be
	 * prepended (if options.insertInPage is true).
	 * @param {string} options.funnel Funnel for EventLogging.
	 * @fires PhotoUploader#start
	 * @fires PhotoUploader#success
	 * @fires PhotoUploader#error
	 * @fires PhotoUploader#cancel
	 */
	/**
	 * Triggered when image upload starts.
	 *
	 * @event PhotoUploader#start
	 */
	/**
	 * Triggered when image upload is finished successfully.
	 *
	 * @event PhotoUploader#success
	 * @property {Object} data Uploaded image data.
	 * @property {string} data.fileName Name of the uploaded image.
	 * @property {string} data.description Name of the uploaded image.
	 * @property {string} data.url URL to the uploaded image (can be a
	 * local data URL).
	 */
	/**
	 * Triggered when image upload fails.
	 *
	 * @event PhotoUploader#error
	 */
	/**
	 * Triggered when image upload is cancelled.
	 *
	 * @event PhotoUploader#cancel
	 */
	PhotoUploaderButton = View.extend( {
		template: M.template.get( 'uploads/PhotoUploaderButton' ),
		className: 'mw-ui-progressive mw-ui-button button photo',

		postRender: function() {
			var self = this, $input = this.$( 'input' );

			function handleFile( file ) {
				var loadingOverlay = new LoadingOverlay();

				loadingOverlay.show();

				mw.loader.using( 'mobile.uploads', function() {
					loadingOverlay.hide();
					// FIXME: this is hacky but it would be hard to pass a file in a route
					M.emit( '_upload-preview', file );
					M.router.navigate( '#/upload-preview/' + self.options.funnel );
				} );
			}

			$input.
				on( 'change', function() {
					handleFile( $input[0].files[0] );
					// clear so that change event is fired again when user selects the same file
					$input.val( '' );
				} );
		}
	} );

	PhotoUploaderButton.isSupported = isSupported();

	M.define( 'modules/uploads/PhotoUploaderButton', PhotoUploaderButton );

}( mw.mobileFrontend, jQuery ) );
