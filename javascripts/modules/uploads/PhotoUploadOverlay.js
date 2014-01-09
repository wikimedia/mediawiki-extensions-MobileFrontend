( function( M, $ ) {
	var popup = M.require( 'toast' ),
		user = M.require( 'user' ),
		OverlayNew = M.require( 'OverlayNew' ),
		Page = M.require( 'Page' ),
		PhotoApi = M.require( 'modules/uploads/PhotoApi' ),
		PhotoUploadProgress = M.require( 'modules/uploads/PhotoUploadProgress' ),
		schema = M.require( 'loggingSchemas/mobileWebUploads' ),
		ownershipMessage = mw.msg( 'mobile-frontend-photo-ownership', user.getName(), user ),
		PhotoUploadOverlay;

	PhotoUploadOverlay = OverlayNew.extend( {
		defaults: {
			license: mw.msg( 'mobile-frontend-photo-license' ),
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
			this._super( options );
		},
		_submit: function() {
			var self = this,
				saveOptions,
				title = this.options.pageTitle,
				description = this.getDescription(),
				api = new PhotoApi(),
				progressPopup = new PhotoUploadProgress();

			saveOptions = {
				file: this.file,
				description: description,
				insertInPage: this.options.insertInPage,
				pageTitle: title
			};
			this.hide( true );
			this.emit( 'hide' );

			progressPopup.show();
			progressPopup.on( 'cancel', function() {
				api.abort();
				self.log( { action: 'cancel' } );
			} );
			api.save( saveOptions ).done( function( fileName, descriptionUrl ) {
				progressPopup.hide( true );
				self.log( { action: 'success' } );
				if ( saveOptions.insertInPage ) {
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
				progressPopup.hide( true );
				popup.show( msg || mw.msg( 'mobile-frontend-photo-upload-error' ), 'toast error' );
				self.log( { action: 'error', errorText: err } );
			} );

			api.on( 'uploadProgress', function( value ) {
				progressPopup.setValue( value );
			} );
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
					self.emit( 'hide' );
				} );
			}
	} );

	M.define( 'modules/uploads/PhotoUploadOverlay', PhotoUploadOverlay );

}( mw.mobileFrontend, jQuery ) );
