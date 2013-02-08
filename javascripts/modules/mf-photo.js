( function( M, $ ) {

	var View = M.require( 'view' ),
		Api = M.require( 'api' ).Api,
		nav = M.require( 'navigation' ),
		popup = M.require( 'notifications' ),
		$page = $( '#content' ),
		endpoint = M.getConfig( 'photo-upload-endpoint' ),
		apiUrl = endpoint || M.getApiUrl(),
		PhotoApi, PhotoUploaderPreview, LeadPhoto, PhotoUploader;

	function needsPhoto( $container ) {
		return $container.find( '#content_0' ).find( '.thumb img, .navbox, .infobox' ).length === 0;
	}

	function isSupported() {
		// FIXME: create a module for browser detection stuff
		var browserSupported = (
			typeof FileReader !== 'undefined' && typeof FormData !== 'undefined' &&
			// webkit only for time being
			window.navigator.userAgent.indexOf( 'WebKit' ) > -1
		);

		return (
			M.isLoggedIn() &&
			browserSupported &&
			!M.getConfig( 'imagesDisabled', false )
		);
	}

	function generateFileName( file, pageTitle ) {
		// FIXME: deal with long and invalid names
		var name = 'Lead_Photo_For_' + pageTitle.replace( / /g, '_' ) + Math.random(),
			extension;

		name = name.replace( String.fromCharCode( 27 ), '-' );
		name = name.replace( /[\x7f\.\[#<>\[\]\|\{\}\/:]/g, '-' );
		extension = file.name.slice( file.name.lastIndexOf( '.' ) + 1 );
		return name + '.' + extension;
	}

	PhotoApi = Api.extend( {
		updatePage: function( options, callback ) {
			var self = this;
			self.getToken( 'edit', function( tokenData ) {
				self.post( {
					action: 'edit',
					title: options.pageTitle,
					token: tokenData.tokens.edittoken,
					comment: mw.msg( 'mobile-frontend-photo-upload-comment' ),
					prependtext: '[[File:' + options.fileName + '|thumbnail|' + options.description + ']]\n\n'
				} ).done( callback );
			} );
		},

		save: function( options, callback ) {
			var self = this;
			options.editSummaryMessage = options.insertInPage ?
				'mobile-frontend-photo-article-edit-comment' :
				'mobile-frontend-photo-article-donate-comment';

			self.getToken( 'edit', function( tokenData ) {
				var formData = new FormData();
				options.fileName = generateFileName( options.file, options.pageTitle );

				formData.append( 'filename', options.fileName );
				formData.append( 'comment', mw.msg( options.editSummaryMessage ) );
				formData.append( 'file', options.file );
				formData.append( 'token', tokenData.tokens.edittoken );
				formData.append( 'text',
					'== {{int:filedesc}} ==\n' + options.description +
					'\n\n== {{int:license-header}} ==\n{{self|cc-by-sa-3.0}}'
				);

				self.post( formData, {
					// iOS seems to ignore the cache parameter so sending r parameter
					// send useformat=mobile for sites where endpoint is a desktop url so that they are mobile edit tagged
					url: apiUrl + '?action=upload&format=json&useformat=mobile&r=' + Math.random() + '&origin=' + M.getOrigin(),
					xhrFields: { 'withCredentials': true },
					cache: false,
					contentType: false,
					processData: false
				} ).done( function( data ) {
					var descriptionUrl = '';
					if ( !data || !data.upload ) {
						// FIXME: use event logging to log errors
						callback( null );
						return;
					}
					options.fileName = data.upload.filename || data.upload.warnings.duplicate['0'];
					if ( data.upload.imageinfo ) {
						descriptionUrl = data.upload.imageinfo.descriptionurl;
					}
					if ( options.insertInPage ) {
						self.updatePage( options, function() {
							// FIXME: check for errors here too?
							callback( options.fileName, descriptionUrl );
						} );
					} else {
						callback( options.fileName, descriptionUrl );
					}
				} );
			}, endpoint );
		}
	} );

	PhotoUploaderPreview = View.extend( {
		defaults: {
			loadingMessage: mw.msg( 'mobile-frontend-image-loading' ),
			license: mw.msg( 'mobile-frontend-photo-license' ),
			cancelButton: mw.msg( 'mobile-frontend-photo-cancel' ),
			submitButton: mw.msg( 'mobile-frontend-photo-submit' ),
			descriptionPlaceholder: mw.msg( 'mobile-frontend-photo-caption-placeholder' )
		},

		template: (
			'<div class="content photoPreview">' +
				'<p class="loading">{{loadingMessage}}</p>' +
				'<textarea name="description" placeholder="{{descriptionPlaceholder}}"></textarea>' +
				'<div class="license">{{{license}}}</div>' +
			'</div>' +
			'<div class="buttonBar">' +
				'<button class="cancel">{{cancelButton}}</button>' +
				'<button class="submit" disabled>{{submitButton}}</button>' +
			'</div>'
		),

		initialize: function() {
			var self = this,
				$description = this.$( 'textarea' ),
				$submitButton = this.$( 'button.submit' );
			this.$description = $description;

			// make license links open in separate tabs
			this.$( '.license a' ).attr( 'target', '_blank' );

			$description.on( 'keyup', function() {
				if ( $description.val() ) {
					$submitButton.removeAttr( 'disabled' );
				} else {
					$submitButton.attr( 'disabled', true );
				}
			} );

			$submitButton.on( 'click', function() {
				self.emit( 'submit' );
			} );
			this.$( 'button.cancel' ).on( 'click', function() {
				self.emit( 'cancel' );
			} );
		},

		getDescription: function() {
			return this.$description.val();
		},

		setImage: function( url ) {
			this.$( '.loading' ).remove();
			$( '<img>' ).attr( 'src', url ).prependTo( this.$( '.photoPreview' ) );
		}
	} );

	LeadPhoto = View.extend( {
		template: (
			'<div class="thumb tright">' +
				'<div class="thumbinner" style="width:222px;">' +
					'<a href="{{pageUrl}}" class="image">' +
						'<img alt="{{caption}}" src="{{url}}" class="thumbimage">' +
					'</a>' +
					'<div class="thumbcaption">{{caption}}</div>' +
				'</div>' +
			'</div>'
		),

		animate: function() {
			this.$el.hide().slideDown();
		}
	} );

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
	PhotoUploader = View.extend( {
		template: (
			'<div class="button photo">' +
				'<div>{{buttonCaption}}</div>' +
				'<input name="file" type="file">' +
			'</div>'
		),

		initialize: function( options ) {
			var self = this, api = new PhotoApi(), $input = this.$( 'input' ), preview;

			this.$input = $input;

			function showPreview( ev ) {
				var dataUrl = ev.target.result;
				// add mimetype if not present (some browsers need it, e.g. Android browser)
				dataUrl = dataUrl.replace( /^data:base64/, 'data:image/jpeg;base64' );
				preview.setImage( dataUrl );

				preview.
					on( 'cancel', function() {
						nav.closeOverlay();
					} ).
					on( 'submit', function() {
						var description = preview.getDescription();

						self.emit( 'start' );
						nav.closeOverlay();
						popup.show( mw.msg( 'mobile-frontend-image-uploading' ), 'locked noButton loading' ).
							find( 'a' ).on( 'click', function() {
								api.abort();
								popup.close( true );
							} );

						api.save( {
							file: $input[0].files[0],
							description: description,
							insertInPage: options.insertInPage,
							pageTitle: options.pageTitle
						}, function( fileName, descriptionUrl ) {
							popup.close();

							if ( !fileName ) {
								popup.show( mw.msg( 'mobile-frontend-photo-upload-error' ), 'toast error' );
								self.emit( 'error' );
								return;
							}

							popup.show( options.successMessage, 'toast ' );

							self.emit( 'success', {
								fileName: fileName,
								description: description,
								descriptionUrl: descriptionUrl,
								url: dataUrl
							} );
						} );
					} );
			}

			$input.
				// accept must be set via attr otherwise cannot use camera on Android
				attr( 'accept', 'image/*;' ).
				on( 'change', function() {
					var fileReader = new FileReader();
					preview = new PhotoUploaderPreview();
					// FIXME: replace if we make overlay an object (and inherit from it?)

					nav.createOverlay( null, preview.$el );
					// skip the URL bar if possible
					window.scrollTo( 0, 1 );

					fileReader.readAsDataURL( $input[0].files[0] );
					fileReader.onload = showPreview;
				} );
		}
	} );

	function initialize() {
		// FIXME: make some general function for that (or a page object with a method)
		var namespaceIds = mw.config.get( 'wgNamespaceIds' ),
			namespace = mw.config.get( 'wgNamespaceNumber' ),
			validNamespace = ( namespace === namespaceIds[''] || namespace === namespaceIds.talk ),
			photoUploader;

		if ( !validNamespace || mw.util.getParamValue( 'action' ) || !needsPhoto( $( '#content' ) ) ) {
			return;
		}

		photoUploader = new PhotoUploader( {
			buttonCaption: mw.msg( 'mobile-frontend-photo-upload' ),
			insertInPage: true,
			pageTitle: M.getConfig( 'title' ),
			successMessage: mw.msg( 'mobile-frontend-photo-upload-success-article' )
		} ).
			insertAfter( $page.find( 'h1' ) ).
			on( 'start', function() {
				photoUploader.remove();
			} ).
			on( 'success', function( data ) {
				new LeadPhoto( {
					url: data.url,
					pageUrl: mw.util.wikiGetlink( 'File:' + data.fileName ),
					caption: data.description
				} ).prependTo( '#content_0' ).animate();
			} ).
			on( 'error', function() {
				photoUploader.insertAfter( $page.find( 'h1' ) );
			} );
	}

	if ( isSupported() ) {
		$( window ).on( 'mw-mf-page-loaded', initialize );
	}

	M.define( 'photo', {
		isSupported: isSupported,
		PhotoUploader: PhotoUploader,
		// just for testing
		needsPhoto: needsPhoto
	} );

}( mw.mobileFrontend, jQuery ) );
