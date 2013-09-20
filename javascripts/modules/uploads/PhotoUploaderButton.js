( function( M, $ ) {
	var View = M.require( 'view' ),
		popup = M.require( 'notifications' ),
		CtaDrawer = M.require( 'CtaDrawer' ),
		LoadingOverlay = M.require( 'LoadingOverlay' ),
		PhotoUploaderButton,
		LeadPhotoUploaderButton;

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
		className: 'button photo',

		initialize: function( options ) {
			this._super( options );
		},

		postRender: function() {
			var self = this, $input = this.$( 'input' ), ctaDrawer;

			// show CTA instead if not logged in
			if ( !M.isLoggedIn() ) {
				ctaDrawer = new CtaDrawer( {
					content: mw.msg( 'mobile-frontend-photo-upload-cta' ),
					queryParams: {
						campaign: 'mobile_uploadPageActionCta',
						returntoquery: 'article_action=photo-upload'
					}
				} );
				this.$el.click( function( ev ) {
					ctaDrawer.show();
					ev.preventDefault();
				} );
				return;
			}

			$input.
				// accept must be set via attr otherwise cannot use camera on Android
				attr( 'accept', 'image/*;' ).
				on( 'change', function() {
					var options = $.extend( {}, self.options, {
						file: $input[0].files[0],
						parent: self
					} ),
						loadingOverlay = new LoadingOverlay();

					loadingOverlay.show();
					mw.loader.using( 'mobile.uploads', function() {
						var PhotoUploader = M.require( 'modules/uploads/PhotoUploader' );
						loadingOverlay.hide();
						new PhotoUploader( options );
					} );

					// clear so that change event is fired again when user selects the same file
					$input.val( '' );
				} );
		}
	} );

	LeadPhotoUploaderButton = PhotoUploaderButton.extend( {
		template: M.template.get( 'uploads/LeadPhotoUploaderButton' ),
		className: 'enabled',

		initialize: function( options ) {
			var self = this;
			this._super( options );
			this.on( 'start', function() {
					self.$el.removeClass( 'enabled' );
				} ).
				on( 'success', function( data ) {
					popup.show( mw.msg( 'mobile-frontend-photo-upload-success-article' ), 'toast' );
					// FIXME: workaround for https://bugzilla.wikimedia.org/show_bug.cgi?id=43271
					if ( !$( '#content_0' ).length ) {
						$( '<div id="content_0" >' ).insertAfter( $( '#section_0,#page-actions' ).last() );
					}

					// just in case, LeadPhoto should be loaded by now anyway
					mw.loader.using( 'mobile.uploads', function() {
						var LeadPhoto = M.require( 'modules/uploads/LeadPhoto' );

						new LeadPhoto( {
							url: data.url,
							pageUrl: data.descriptionUrl,
							caption: data.description
						} ).prependTo( '#content_0' );
					} );
				} ).
				on( 'error cancel', function() {
					self.$el.addClass( 'enabled' );
				} );
		}
	} );

	PhotoUploaderButton.isSupported = LeadPhotoUploaderButton.isSupported = isSupported();

	// FIXME: should we allow more than one define() per file?
	M.define( 'modules/uploads/PhotoUploaderButton', PhotoUploaderButton );
	M.define( 'modules/uploads/LeadPhotoUploaderButton', LeadPhotoUploaderButton );

}( mw.mobileFrontend, jQuery ) );
