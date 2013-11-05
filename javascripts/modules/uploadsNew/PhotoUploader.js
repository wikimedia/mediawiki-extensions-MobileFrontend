( function( M, $ ) {
	var Class = M.require( 'Class' ),
		popup = M.require( 'notifications' ),
		PhotoApi = M.require( 'modules/uploads/PhotoApi' ),
		PhotoUploadProgress = M.require( 'modules/uploadsNew/PhotoUploadProgress' ),
		PhotoUploaderPreview = M.require( 'modules/uploadsNew/PhotoUploaderPreview' ),
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
			var fileReader = new FileReader(), preview;

			this.log = getLog( options.funnel );
			preview = this.preview = new PhotoUploaderPreview( { log: this.log } );

			this.options = options;
			this.parent = options.parent;
			this.file = options.file;

			this._showPreview();

			fileReader.readAsDataURL( this.file );
			fileReader.onload = function() {
				var dataUrl = fileReader.result;
				// add mimetype if not present (some browsers need it, e.g. Android browser)
				dataUrl = dataUrl.replace( /^data:base64/, 'data:image/jpeg;base64' );
				preview.setImageUrl( dataUrl );
			};
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

	M.define( 'modules/uploadsNew/PhotoUploader', PhotoUploader );

}( mw.mobileFrontend, jQuery ) );
