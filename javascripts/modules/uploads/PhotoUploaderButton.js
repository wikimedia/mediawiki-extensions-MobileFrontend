( function ( M, $ ) {
	var browser = M.require( 'browser' ),
		View = M.require( 'View' ),
		Icon = M.require( 'Icon' ),
		photoIcon = new Icon( {
			name: 'photo',
			hasText: true,
			additionalClassNames: 'mw-ui-progressive mw-ui-button button'
		} ),
		router = M.require( 'router' ),
		PhotoUploaderButton;

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
		events: {
			'change input': 'onFileSelected'
		},

		/**
		 * Event handler, called when a file is selected in the input
		 * @param {jQuery.Event} ev
		 */
		onFileSelected: function ( ev ) {
			var $input = $( ev.target );
			this.handleFile( $input[0].files[0] );
			// clear so that change event is fired again when user selects the same file
			$input.val( '' );
		},

		/**
		 * Handle a selected file for upload, emit event and route to the
		 * appropiate url
		 * @param {File} file associated with file upload input
		 */
		handleFile: function ( file ) {
			// FIXME: this is hacky but it would be hard to pass a file in a route
			M.emit( '_upload-preview', file );
			router.navigate( '#/upload-preview/' + this.options.funnel );
		},

		/** @inheritdoc */
		postRender: function () {
			this.$el.removeClass( 'hidden' );
		}
	} );

	PhotoUploaderButton.isSupported = browser.supportsFileUploads();

	M.define( 'modules/uploads/PhotoUploaderButton', PhotoUploaderButton );

}( mw.mobileFrontend, jQuery ) );
