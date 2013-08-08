( function( M, $ ) {
	var View = M.require( 'view' ),
		popup = M.require( 'notifications' ),
		CtaDrawer = M.require( 'CtaDrawer' ),
		NagOverlay = M.require( 'modules/uploads/NagOverlay' ),
		PhotoApi = M.require( 'modules/uploads/PhotoApi' ),
		PhotoUploadProgress = M.require( 'modules/uploads/PhotoUploadProgress' ),
		PhotoUploaderPreview = M.require( 'modules/uploads/PhotoUploaderPreview' ),
		PhotoUploader,
		PhotoUploaderButton,
		LeadPhoto = M.require( 'modules/uploads/LeadPhoto' ),
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

	function getLog( funnel ) {
		return function( data ) {
			if ( mw.config.get( 'wgArticleId', -1 ) !== -1 ) {
				data.pageId = mw.config.get( 'wgArticleId' );
			}

			M.log( 'MobileWebUploads', $.extend( {
				token: M.getSessionId(),
				funnel: funnel,
				username: mw.config.get( 'wgUserName' ),
				isEditable: mw.config.get( 'wgIsPageEditable' ),
				mobileMode: mw.config.get( 'wgMFMode' ),
				userAgent: window.navigator.userAgent
			}, data ) );
		};
	}

	/**
	 * PhotoUploader is a component for uploading images to the wiki.
	 *
	 * @example
	 * <code>
	 * var photoUploader = new PhotoUploader( {
	 *     buttonCaption: 'Add a photo',
	 * } );
	 * photoUploader.
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
	PhotoUploader = View.extend( {

		initialize: function( options ) {
			this.log = getLog( options.funnel );
			this._super( options );
		},

		postRender: function() {
			var self = this, $input = this.$( 'input' ), ctaDrawer;

			// show CTA instead if not logged in
			if ( !M.isLoggedIn() ) {
				ctaDrawer = new CtaDrawer( {
					content: mw.msg( 'mobile-frontend-photo-upload-cta' ),
					returnToQuery: 'article_action=photo-upload'
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
					var nagCount = parseInt( M.settings.getUserSetting( 'uploadNagCount' ) || 0, 10 ),
						shouldNag = parseInt( mw.config.get( 'wgUserEditCount' ), 10 ) < 3,
						fileReader = new FileReader(), nagOverlay;

					self.preview = new PhotoUploaderPreview( { log: self.log } );

					self.file = $input[0].files[0];
					// clear so that change event is fired again when user selects the same file
					$input.val( '' );

					// nag if never nagged and shouldNag and then keep nagging (3 times)
					if ( ( nagCount === 0 && shouldNag ) || ( nagCount > 0 && nagCount < 3 ) ) {
						// FIXME: possibly set self.preview.parent = nagOverlay when nagOverlay is present
						nagOverlay = self._showNagOverlay( nagCount );
					} else {
						self._showPreview();
					}

					fileReader.readAsDataURL( self.file );
					fileReader.onload = function() {
						var dataUrl = fileReader.result;
						// add mimetype if not present (some browsers need it, e.g. Android browser)
						dataUrl = dataUrl.replace( /^data:base64/, 'data:image/jpeg;base64' );

						if ( nagOverlay ) {
							nagOverlay.setImageUrl( dataUrl );
						}
						self.preview.setImageUrl( dataUrl );
					};
				} );
		},

		_showNagOverlay: function( nagCount ) {
			var self = this, nagMessages = [], nagOverlay;

			switch ( nagCount ) {
				case 0:
					nagMessages = $.map( [2, 1], function( val ) {
						// Dynamically create keys for mobile-frontend-photo-nag-1-bullet-1-heading,
						// mobile-frontend-photo-nag-1-bullet-2-heading,
						// mobile-frontend-photo-nag-1-bullet-1-text and  mobile-frontend-photo-nag-1-bullet-2-text
						return {
							heading: mw.msg( 'mobile-frontend-photo-nag-1-bullet-' + val + '-heading' ),
							text: mw.msg( 'mobile-frontend-photo-nag-1-bullet-' + val + '-text' )
						};
					} );
					break;

				case 1:
				case 2:
					// Dynamically create keys mobile-frontend-photo-nag-2-bullet-1-heading and mobile-frontend-photo-nag-3-bullet-1-heading
					nagMessages = [
						{ heading: mw.msg( 'mobile-frontend-photo-nag-' + ( nagCount + 1 ) + '-bullet-1-heading' ) }
					];
					break;
			}

			nagOverlay = new NagOverlay( { nagMessages: nagMessages } );
			nagOverlay.
				on( 'confirm', $.proxy( self, '_showPreview' ) ).
				show();

			M.settings.saveUserSetting( 'uploadNagCount', nagCount + 1 );

			return nagOverlay;
		},

		_showPreview: function() {
			var self = this;

			self.log( { action: 'preview' } );
			self.preview.
				on( 'cancel', function() {
					self.log( { action: 'previewCancel' } );
				} ).
				on( 'submit', function() {
					self.log( { action: 'previewSubmit' } );
					self._submit();
				} );

			self.preview.show();
			// skip the URL bar if possible
			window.scrollTo( 0, 1 );
		},

		_submit: function() {
			var self = this,
				description = this.preview.getDescription(),
				api = new PhotoApi(),
				progressPopup = new PhotoUploadProgress();

			this.emit( 'start' );
			this.preview.hide();
			progressPopup.show();
			progressPopup.on( 'cancel', function() {
				api.abort();
				self.log( { action: 'cancel' } );
				self.emit( 'cancel' );
			} );

			api.save( {
				file: this.file,
				description: description,
				insertInPage: this.options.insertInPage,
				pageTitle: this.options.pageTitle
			} ).done( function( fileName, descriptionUrl ) {
				progressPopup.hide();
				self.log( { action: 'success' } );
				self.emit( 'success', {
					fileName: fileName,
					description: description,
					descriptionUrl: descriptionUrl,
					url: self.preview.imageUrl
				} );
			} ).fail( function( err, msg ) {
				progressPopup.hide();
				popup.show( msg || mw.msg( 'mobile-frontend-photo-upload-error' ), 'toast error' );
				self.log( { action: 'error', errorText: err } );
				self.emit( 'error' );
			} );

			api.on( 'uploadProgress', function( value ) {
				progressPopup.setValue( value );
			} );
		}
	} );

	// An extension of the PhotoUploader which instead of treating it as a button treats it as a full screen bar
	PhotoUploaderButton = PhotoUploader.extend( {
		template: M.template.get( 'photoUploader' ),
		className: 'button photo'
	} );

	LeadPhotoUploaderButton = PhotoUploader.extend( {
		template: M.template.get( 'photoUploadAction' ),
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
					new LeadPhoto( {
						url: data.url,
						pageUrl: data.descriptionUrl,
						caption: data.description
					} ).prependTo( '#content_0' );
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
