/* global EXIF */
( function( M, $ ) {
	var popup = M.require( 'toast' ),
		user = M.require( 'user' ),
		OverlayNew = M.require( 'OverlayNew' ),
		Page = M.require( 'Page' ),
		EditorApi = M.require( 'modules/editor/EditorApi' ),
		PhotoApi = M.require( 'modules/uploads/PhotoApi' ),
		PhotoUploadProgress = M.require( 'modules/uploads/PhotoUploadProgress' ),
		schema = M.require( 'loggingSchemas/mobileWebUploads' ),
		ownershipMessage = mw.msg( 'mobile-frontend-photo-ownership', user.getName(), user ),
		PhotoUploadOverlay;

	/**
	 * @class PhotoUploadOverlay
	 * @extends OverlayNew
	 */
	PhotoUploadOverlay = OverlayNew.extend( {
		defaults: {
			descriptionPlaceholder: mw.msg( 'mobile-frontend-photo-caption-placeholder' ),
			help: mw.msg( 'mobile-frontend-photo-ownership-help' ),
			ownerStatement: ownershipMessage,
			heading: mw.msg( 'mobile-frontend-image-heading-describe' ),
			headerButtonsListClassName: '',
			headerButtons: [
				{ className: 'submit icon', msg: mw.msg( 'mobile-frontend-photo-submit' ) }
			]
		},

		className: 'overlay photo-overlay',

		templatePartials: {
			content: M.template.get( 'uploads/PhotoUploadOverlay' )
		},

		initialize: function( options ) {
			var fileReader = new FileReader(), self = this;
			this.log = schema.getLog( options.funnel );
			this.file = options.file;

			if ( this.file ) {
				fileReader.readAsDataURL( options.file );
				fileReader.onload = function() {
					var dataUri = fileReader.result;
					// add mimetype if not present (some browsers need it, e.g. Android browser)
					dataUri = dataUri.replace( /^data:base64/, 'data:image/jpeg;base64' );
					self.log( { action: 'preview' } );
					self.setImageUrl( dataUri );
				};
			}

			if ( options.insertInPage ) {
				this.api = new PhotoApi( {
					editorApi: new EditorApi( { title: options.pageTitle } )
				} );
			} else {
				this.api = new PhotoApi();
			}
			this.api.on( 'uploadProgress', function( value ) {
				self.progressPopup.setValue( value );
			} );

			this.progressPopup = new PhotoUploadProgress().on( 'cancel', function() {
				self.api.abort();
				self.log( { action: 'cancel' } );
			} ).on( 'submit', function() {
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

			this._super( options );
		},

		_save: function() {
			var
				self = this,
				description = this.getDescription(),
				saveOptions = {
					file: this.file,
					description: description
				};

			this.api.save( saveOptions ).done( function( fileName, descriptionUrl ) {
				var title = self.options.pageTitle;

				self.progressPopup.hide( true );

				self.log( { action: 'success' } );
				if ( self.options.insertInPage ) {
					popup.show( mw.msg( 'mobile-frontend-photo-upload-success-article' ), 'toast' );

					// FIXME: add helper M.refreshPage function
					M.pageApi.invalidatePage( title );
					new Page( { title: title, el: $( '#content_wrapper' ) } ).on( 'ready', M.reloadPage );
				} else {
					// FIXME: handle Special:Uploads case - find more generic way of doing this
					M.emit( '_file-upload', {
						fileName: fileName,
						description: description,
						descriptionUrl: descriptionUrl,
						url: self.imageUrl
					} );
				}
			} ).fail( function( err, msg ) {
				var errMsg;

				if ( err.type === 'abusefilter' ) {
					self.progressPopup.showAbuseFilter( err.details.type, err.details.message );
				} else {
					self.progressPopup.hide( true );
					popup.show( msg || mw.msg( 'mobile-frontend-photo-upload-error' ), 'toast error' );

					errMsg = err.stage + '/' + err.type;
					if ( typeof err.details === 'string' ) {
						errMsg += '/' + err.details;
					}
					self.log( { action: 'error', errorText: errMsg } );
				}
			} );
		},

		_submit: function() {
			this.hide( true );

			this.progressPopup.show();

			this._save();
		},

		postRender: function() {
			var self = this, $submitButton;

			this._super();

			$submitButton = this.$( '.submit' ).
				prop( 'disabled', true ).
				on( M.tapEvent( 'click' ), function() {
					self.log( { action: 'previewSubmit' } );
					self._submit();
				} );
			this.$description = this.$( 'textarea' ).
				microAutosize().
				// use input event too, Firefox doesn't fire keyup on many devices:
				// https://bugzilla.mozilla.org/show_bug.cgi?id=737658
				on( 'keyup input', function() {
					$submitButton.prop( 'disabled', self.$description.val() === '' );
				} );

			// make license links open in separate tabs
			this.$( '.license a' ).attr( 'target', '_blank' );

			// Deal with case where user refreshes the page
			if ( !self.file ) {
				M.router.navigate( '#' );
			}
		},

		show: function() {
			var self = this;

			this._super();

			if ( this.file && M.isBetaGroupMember() ) {
				EXIF.getData( this.file, function() {
					if ( $.isEmptyObject( this.exifdata ) ) {
						if ( window.confirm( mw.msg( 'mobile-frontend-photo-upload-copyvio' ) ) ) {
							self.log( { action: 'copyvioOk' } );
						} else {
							self.log( { action: 'copyvioCancel' } );
							self.hide( true );
						}
					}
				} );
			}
		},

		hide: function( force ) {
			// In the case of a missing file force close
			if ( force || !this.file ) {
				return this._super();
			} else if ( window.confirm( mw.msg( 'mobile-frontend-image-cancel-confirm' ) ) ) {
				this.emit( 'cancel' );
				this.log( { action: 'previewCancel' } );
				return this._super();
			} else {
				return false;
			}
		},

		getDescription: function() {
			return this.$description.val();
		},

		setImageUrl: function( url ) {
			var self = this, $preview = this.$( '.preview' );

			this.imageUrl = url;
			$preview.removeClass( 'loading' );
			this.$( '.help' ).on( 'click', function() {
				self.log( { action: 'whatDoesThisMean' } );
			} );
			$( '<img>' ).
				attr( 'src', url ).
				appendTo( $preview ).
				on( 'error', function() {
					// When using a bad filetype close the overlay
					popup.show( mw.msg( 'mobile-frontend-photo-upload-error-file-type' ), 'toast error' );
					self.hide( true );
				} );
			}
	} );

	M.define( 'modules/uploads/PhotoUploadOverlay', PhotoUploadOverlay );

}( mw.mobileFrontend, jQuery ) );
