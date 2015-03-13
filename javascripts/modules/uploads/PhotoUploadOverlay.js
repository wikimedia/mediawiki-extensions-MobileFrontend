/* global EXIF */
( function ( M, $ ) {
	var popup = M.require( 'toast' ),
		user = M.require( 'user' ),
		router = M.require( 'router' ),
		Overlay = M.require( 'Overlay' ),
		EditorApi = M.require( 'modules/editor/EditorApi' ),
		PhotoApi = M.require( 'modules/uploads/PhotoApi' ),
		PhotoUploadProgress = M.require( 'modules/uploads/PhotoUploadProgress' ),
		SchemaMobileWebUploads = M.require( 'loggingSchemas/SchemaMobileWebUploads' ),
		ownershipMessage = mw.msg( 'mobile-frontend-photo-ownership', user.getName(), user ),
		PhotoUploadOverlay;

	/**
	 * Overlay for photo upload
	 * @class PhotoUploadOverlay
	 * @uses PhotoApi
	 * @extends Overlay
	 */
	PhotoUploadOverlay = Overlay.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Page} defaults.page the page being uploaded to
		 * @cfg {String} defaults.descriptionPlaceholder Placeholder text prompting user to add
		 * a mandatory caption to an image.
		 * @cfg {String} defaults.help A link that allows the user to open more information
		 * about photo ownership.
		 * @cfg {String} defaults.ownerStatement A statement saying the user created the image.
		 * @cfg {String} defaults.heading A heading instructing the user to describe uploaded image.
		 * @cfg {String} defaults.headerButtonsListClassName Class name of the wrapper of the
		 * header buttons.
		 * @cfg {Array} defaults.headerButtons Objects that will be used as defaults to create
		 * header buttons. Defaults to the 'submit' button.
		 */
		defaults: {
			page: undefined,
			descriptionPlaceholder: mw.msg( 'mobile-frontend-photo-caption-placeholder' ),
			help: mw.msg( 'mobile-frontend-photo-ownership-help' ),
			ownerStatement: ownershipMessage,
			heading: mw.msg( 'mobile-frontend-image-heading-describe' ),
			headerButtonsListClassName: 'overlay-action',
			headerButtons: [ {
				className: 'submit',
				msg: mw.msg( 'mobile-frontend-photo-submit' )
			} ]
		},
		/** @inheritdoc */
		events: $.extend( {}, Overlay.prototype.events, {
			'click .submit': 'onSubmit',
			'keyup textarea': 'onDescriptionChange',
			// use input event too, Firefox doesn't fire keyup on many devices:
			// https://bugzilla.mozilla.org/show_bug.cgi?id=737658
			'input textarea': 'onDescriptionChange'
		} ),

		className: 'overlay photo-overlay',

		templatePartials: {
			content: mw.template.get( 'mobile.uploads', 'PhotoUploadOverlay.hogan' )
		},

		/** @inheritdoc */
		initialize: function ( options ) {
			var fileReader = new FileReader(),
				self = this;

			this.schema = new SchemaMobileWebUploads( {
				funnel: options.funnel
			} );
			this.file = options.file;

			if ( this.file ) {
				fileReader.readAsDataURL( options.file );
				/**
				 * onload event for FileReader
				 * @ignore
				 */
				fileReader.onload = function () {
					var dataUri = fileReader.result;
					// add mimetype if not present (some browsers need it, e.g. Android browser)
					dataUri = dataUri.replace( /^data:base64/, 'data:image/jpeg;base64' );
					self.schema.log( {
						action: 'preview'
					} );
					self.setImageUrl( dataUri );
				};
			}

			if ( options.insertInPage ) {
				this.api = new PhotoApi( {
					page: options.page,
					editorApi: new EditorApi( {
						// FIXME: Use options.page instead
						title: options.pageTitle
					} )
				} );
			} else {
				this.api = new PhotoApi( {
					page: options.page
				} );
			}
			this.api.on( 'uploadProgress', function ( value ) {
				self.progressPopup.setValue( value );
			} );

			this.progressPopup = new PhotoUploadProgress().on( 'cancel', function () {
				self.api.abort();
				self.schema.log( {
					action: 'cancel'
				} );
			} ).on( 'submit', function () {
				// handle resubmitting after abusefilter message
				self._save();
			} );

			// If terms of use is enabled, include it in the licensing message
			if ( $( '#footer-places-terms-use' ).length > 0 ) {
				options.license = mw.msg(
					'mobile-frontend-photo-licensing-with-terms',
					$( '#footer-places-terms-use' ).html(),
					mw.config.get( 'wgMFUploadLicenseLink' )
				);
			} else {
				options.license = mw.msg(
					'mobile-frontend-photo-licensing',
					mw.config.get( 'wgMFUploadLicenseLink' )
				);
			}

			Overlay.prototype.initialize.apply( this, arguments );
		},

		/**
		 * Performs a file upload based on current state of PhotoUploadOverlay
		 * When succeeds either reloads page or emits a global event _file-upload
		 * If error occurs shows a toast
		 * @uses PhotoApi
		 * @private
		 */
		_save: function () {
			var
				self = this,
				description = this.getDescription(),
				saveOptions = {
					file: this.file,
					description: description
				};

			this.api.save( saveOptions ).done( function ( fileName, descriptionUrl ) {
				self.progressPopup.hide( true );

				self.schema.log( {
					action: 'success'
				} );
				if ( self.options.insertInPage ) {
					popup.show( mw.msg( 'mobile-frontend-photo-upload-success-article' ), 'toast' );

					// reload the page
					window.location.reload();
				} else {
					/**
					 * @event _file-upload
					 * Emits global event _file-upload.
					 * FIXME: handle Special:Uploads case - find more generic way of doing this
					 */
					M.emit( '_file-upload', {
						fileName: fileName,
						description: description,
						descriptionUrl: descriptionUrl,
						url: self.imageUrl
					} );
				}
			} ).fail( function ( err, statusMessage, httpErrorThrown ) {
				var errMsg;

				if ( err.type === 'abusefilter' ) {
					self.progressPopup.showAbuseFilter( err.details.type, err.details.message );
				} else {
					self.progressPopup.hide( true );
					popup.show( statusMessage || mw.msg( 'mobile-frontend-photo-upload-error' ), 'toast error' );
					// If there is error information in API response, report that in the log
					if ( err.stage !== undefined || err.type !== undefined ) {
						errMsg = err.stage + '/' + err.type;
						if ( typeof err.details === 'string' ) {
							errMsg += '/' + err.details;
						}
						// Otherwise, record the stage as 'unknown' and record the type as the
						// status message ("timeout", "error", "abort", etc. ) and include any
						// HTTP error that was thrown.
					} else {
						errMsg = 'unknown';
						if ( statusMessage ) {
							errMsg += '/' + statusMessage;
							if ( httpErrorThrown ) {
								errMsg += '/' + httpErrorThrown;
							}
						}
					}
					self.schema.log( {
						action: 'error',
						errorText: errMsg
					} );
				}
			} );
		},

		/**
		 * Submits a photo for upload, reveals a progress bar and hides the overlay.
		 * Invokes _save method.
		 * @private
		 */
		_submit: function () {
			this.hide( true );

			this.progressPopup.show();

			this._save();
		},

		/** @inheritdoc */
		postRender: function () {
			var $submitButton,
				self = this;

			Overlay.prototype.postRender.apply( this, arguments );

			$submitButton = this.$( '.submit' )
				.prop( 'disabled', true );
			this.$description = this.$( 'textarea' )
				.microAutosize();

			// make license links open in separate tabs
			this.$( '.license a' ).attr( 'target', '_blank' );

			// Deal with case where user refreshes the page
			if ( !self.file ) {
				router.navigate( '#' );
			}
		},

		/** @inheritdoc */
		show: function () {
			var self = this;

			Overlay.prototype.show.apply( this, arguments );

			if ( this.file ) {
				EXIF.getData( this.file, function () {
					if ( $.isEmptyObject( this.exifdata ) ) {
						if ( window.confirm( mw.msg( 'mobile-frontend-photo-upload-copyvio' ) ) ) {
							self.schema.log( {
								action: 'copyvioOk'
							} );
						} else {
							self.schema.log( {
								action: 'copyvioCancel'
							} );
							self.hide( true );
						}
					}
				} );
			}
		},

		/** @inheritdoc */
		hide: function ( force ) {
			var _super = Overlay.prototype.hide;
			// In the case of a missing file force close
			if ( force || !this.file ) {
				return _super.apply( this, arguments );
			} else if ( window.confirm( mw.msg( 'mobile-frontend-image-cancel-confirm' ) ) ) {
				this.emit( 'cancel' );
				this.schema.log( {
					action: 'previewCancel'
				} );
				return _super.apply( this, arguments );
			} else {
				return false;
			}
		},

		/**
		 * Gets the user inputted description
		 * @returns {String} of current value of description according to view
		 */
		getDescription: function () {
			return this.$description.val();
		},

		/**
		 * Set the url of the image in the preview.
		 * Throws toast if for some reason image cannot render e.g. bad file type.
		 * @param {String} url usually a data uri
		 */
		setImageUrl: function ( url ) {
			var self = this,
				$preview = this.$( '.preview' );

			this.imageUrl = url;
			this.$( '.spinner' ).hide();
			this.$( '.help' ).on( 'click', function () {
				self.schema.log( {
					action: 'whatDoesThisMean'
				} );
			} );
			$( '<img>' )
				.attr( 'src', url )
				.appendTo( $preview )
				.on( 'error', function () {
					// When using a bad filetype close the overlay
					popup.show( mw.msg( 'mobile-frontend-photo-upload-error-file-type' ), 'toast error' );
					self.hide( true );
				} );
		},

		/**
		 * event handler to submit
		 */
		onSubmit: function () {
			this.schema.log( {
				action: 'previewSubmit'
			} );
			this._submit();
		},

		/**
		 * event handler for changing description of property
		 */
		onDescriptionChange: function () {
			this.$( '.submit' ).prop( 'disabled', this.$( 'textarea' ).val() === '' );
		}
	} );

	M.define( 'modules/uploads/PhotoUploadOverlay', PhotoUploadOverlay );

}( mw.mobileFrontend, jQuery ) );
