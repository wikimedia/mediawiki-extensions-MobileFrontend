( function( M, $ ) {
	var Class = M.require( 'Class' ),
		popup = M.require( 'notifications' ),
		NagOverlay = M.require( 'modules/uploads/NagOverlay' ),
		PhotoApi = M.require( 'modules/uploads/PhotoApi' ),
		PhotoUploadProgress = M.require( 'modules/uploads/PhotoUploadProgress' ),
		PhotoUploaderPreview = M.require( 'modules/uploads/PhotoUploaderPreview' ),
		PhotoUploader;

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

	PhotoUploader = Class.extend( {

		initialize: function( options ) {
			var nagCount = parseInt( M.settings.getUserSetting( 'uploadNagCount' ) || 0, 10 ),
				shouldNag = parseInt( mw.config.get( 'wgUserEditCount' ), 10 ) < 3,
				fileReader = new FileReader(), nagOverlay, preview;

			this.log = getLog( options.funnel );
			preview = this.preview = new PhotoUploaderPreview( { log: this.log } );

			this.options = options;
			this.parent = options.parent;
			this.file = options.file;

			// nag if never nagged and shouldNag and then keep nagging (3 times)
			if ( ( nagCount === 0 && shouldNag ) || ( nagCount > 0 && nagCount < 3 ) ) {
				// FIXME: possibly set self.preview.parent = nagOverlay when nagOverlay is present
				nagOverlay = this._showNagOverlay( nagCount );
			} else {
				this._showPreview();
			}

			fileReader.readAsDataURL( this.file );
			fileReader.onload = function() {
				var dataUrl = fileReader.result;
				// add mimetype if not present (some browsers need it, e.g. Android browser)
				dataUrl = dataUrl.replace( /^data:base64/, 'data:image/jpeg;base64' );

				if ( nagOverlay ) {
					nagOverlay.setImageUrl( dataUrl );
				}
				preview.setImageUrl( dataUrl );
			};
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

			this.parent.emit( 'start' );
			this.preview.hide();
			progressPopup.show();
			progressPopup.on( 'cancel', function() {
				api.abort();
				self.log( { action: 'cancel' } );
				self.parent.emit( 'cancel' );
			} );

			api.save( {
				file: this.file,
				description: description,
				insertInPage: this.options.insertInPage,
				pageTitle: this.options.pageTitle
			} ).done( function( fileName, descriptionUrl ) {
				progressPopup.hide();
				self.log( { action: 'success' } );
				self.parent.emit( 'success', {
					fileName: fileName,
					description: description,
					descriptionUrl: descriptionUrl,
					url: self.preview.imageUrl
				} );
			} ).fail( function( err, msg ) {
				progressPopup.hide();
				popup.show( msg || mw.msg( 'mobile-frontend-photo-upload-error' ), 'toast error' );
				self.log( { action: 'error', errorText: err } );
				self.parent.emit( 'error' );
			} );

			api.on( 'uploadProgress', function( value ) {
				progressPopup.setValue( value );
			} );
		}
	} );

	M.define( 'modules/uploads/PhotoUploader', PhotoUploader );

}( mw.mobileFrontend, jQuery ) );
