( function( M, $ ) {

	var View = M.require( 'view' ),
		Api = M.require( 'api' ).Api,
		EventEmitter = M.require( 'eventemitter' ),
		ProgressBar = M.require( 'widgets/progress-bar' ),
		nav = M.require( 'navigation' ),
		popup = M.require( 'notifications' ),
		endpoint = mw.config.get( 'wgMFPhotoUploadEndpoint' ),
		apiUrl = endpoint || M.getApiUrl(),
		PhotoApi, PhotoUploaderPreview, LeadPhoto, PhotoUploadProgress, PhotoUploader;

	function needsPhoto( $container ) {
		var $content_0 = $container.find( '#content_0' );
		// workaround for https://bugzilla.wikimedia.org/show_bug.cgi?id=43271
		if ( $content_0.length ) {
			$container = $content_0;
		}

		return $container.find( 'img, .navbox, .infobox' ).length === 0;
	}

	function isSupported() {
		// FIXME: create a module for browser detection stuff
		var browserSupported = (
			typeof FileReader !== 'undefined' &&
			typeof FormData !== 'undefined' &&
			($('<input type="file"/>').prop('type') === 'file') // Firefox OS 1.0 turns <input type="file"> into <input type="text">
		);

		return (
			M.isLoggedIn() &&
			browserSupported &&
			!mw.config.get( 'wgImagesDisabled', false )
		);
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

	// Originally written by Brion for WikiLovesMonuments app
	function trimUtf8String( str, allowedLength ) {
		// Count UTF-8 bytes to see where we need to crop long names.
		var bytes = 0, chars = 0, codeUnit, len, i;

		for ( i = 0; i < str.length; i++ ) {
			// JavaScript strings are UTF-16.
			codeUnit = str.charCodeAt( i );

			// http://en.wikipedia.org/wiki/UTF-8#Description
			if ( codeUnit < 0x80 ) {
				len = 1;
			} else if ( codeUnit < 0x800 ) {
				len = 2;
			} else if ( codeUnit >= 0xd800 && codeUnit < 0xe000 ) {
				// http://en.wikipedia.org/wiki/UTF-16#Description
				// Code point is one half of a surrogate pair.
				// This and its partner combine to form a single 4 byte character in UTF-8.
				len = 4;
			} else {
				len = 3;
			}

			if ( bytes + len <= allowedLength ) {
				bytes += len;
				chars++;
				if ( len === 4 ) {
					// Skip over second half of surrogate pair as a unit.
					chars++;
					i++;
				}
			} else {
				// Ran out of bytes.
				return str.substr( 0, chars );
			}
		}

		// We fit!
		return str;
	}

	/**
	 * Generates a file name from a description and a date
	 * Removes illegal characters
	 * Respects maximum file name length (240 bytes)
	 *
	 * @param {String} description: Data to be preprocessed and added to options
	 * @param {String} suffix: An optional file extension e.g. '.jpg' or '.gif'
	 * @param {Date} date: An optional date (defaults to current date)
	 * @return {String} a legal filename
	 */
	function generateFileName( description, fileSuffix, date ) {
		var allowedLength = 240, // 240 bytes maximum enforced by MediaWiki
			delimiter = '-', name, suffix;

		fileSuffix = fileSuffix || '.jpg';
		date = date || new Date();
		name = description.replace( /[\x1B\n\x7f\.\[#<>\[\]\|\{\}\/:]/g, delimiter );

		function pad( number ) {
			return number < 9 ? '0' + number : number;
		}

		suffix = ' ' + date.getFullYear() + delimiter +
			pad( date.getMonth() + 1 ) + delimiter + pad( date.getDate() ) + ' ' +
			pad( date.getHours() ) + delimiter + pad( date.getMinutes() ) + fileSuffix;

		allowedLength = allowedLength - suffix.length;
		return trimUtf8String( name, allowedLength ) + suffix;
	}

	PhotoApi = Api.extend( {
		updatePage: function( options, callback ) {
			var self = this;
			self.getToken( 'edit', function( tokenData ) {
				self.post( {
					action: 'edit',
					title: options.pageTitle,
					token: tokenData.tokens.edittoken,
					summary: mw.msg( 'mobile-frontend-photo-upload-comment' ),
					prependtext: '[[File:' + options.fileName + '|thumbnail|' + options.description + ']]\n\n'
				} ).done( callback );
			} );
		},

		save: function( options ) {
			var self = this, result = $.Deferred();

			options.editSummaryMessage = options.insertInPage ?
				'mobile-frontend-photo-article-edit-comment' :
				'mobile-frontend-photo-article-donate-comment';

			function doUpload( token ) {
				var formData = new FormData(), descTextToAppend,
					ext = options.file.name.slice( options.file.name.lastIndexOf( '.' ) + 1 );

				descTextToAppend = mw.config.get( 'wgPhotoUploadAppendToDesc' );
				descTextToAppend = descTextToAppend ? '\n\n' + descTextToAppend : '';
				options.fileName = generateFileName( options.description, '.' + ext );

				formData.append( 'action', 'upload' );
				formData.append( 'format', 'json' );
				// add origin only when doing CORS
				if ( endpoint ) {
					formData.append( 'origin', M.getOrigin() );
				}
				formData.append( 'filename', options.fileName );
				formData.append( 'comment', mw.msg( options.editSummaryMessage ) );
				formData.append( 'file', options.file );
				formData.append( 'token', token );
				formData.append( 'text',
					'== {{int:filedesc}} ==\n' + options.description +
					descTextToAppend +
					'\n\n== {{int:license-header}} ==\n{{self|cc-by-sa-3.0}}'
				);

				self.post( formData, {
					// iOS seems to ignore the cache parameter so sending r parameter
					// send useformat=mobile for sites where endpoint is a desktop url so that they are mobile edit tagged
					url: apiUrl + '?useformat=mobile&r=' + Math.random(),
					xhrFields: { 'withCredentials': true },
					cache: false,
					contentType: false,
					processData: false
				} ).on( 'progress', function( ev ) {
					if ( ev.lengthComputable ) {
						self.emit( 'progress', ev.loaded / ev.total );
					}
				} ).done( function( data ) {
					var descriptionUrl = '',
						warnings = data.upload ? data.upload.warnings : false;
					if ( !data || !data.upload ) {
						// error uploading image
						result.reject( data.error ? data.error.info : '' );
						return;
					}
					options.fileName = data.upload.filename;
					if ( warnings ) {
						if ( warnings.duplicate ) {
							options.fileName = warnings.duplicate[ '0' ];
						} else if ( warnings.exists ) {
							return result.reject( 'Filename exists',
								mw.msg( 'mobile-frontend-photo-upload-error-filename' ) );
						}
					}
					// FIXME: API doesn't return this information on duplicate images...
					if ( data.upload.imageinfo ) {
						descriptionUrl = data.upload.imageinfo.descriptionurl;
					}
					if ( options.insertInPage ) {
						self.updatePage( options, function( data ) {
							if ( !data || data.error ) {
								// error updating page's wikitext
								result.reject( data.error.info );
							} else {
								result.resolve( options.fileName, descriptionUrl );
							}
						} );
					} else {
						result.resolve( options.fileName, descriptionUrl );
					}
				} ).fail( function( xhr, status, error ) {
					// error on the server side (abort happens when user cancels the upload)
					if ( status !== 'abort' ) {
						result.reject( status + ': ' + error );
					}
				} );
			}
			self.getToken( 'edit', function( tokenData ) {
				var token;
				if ( tokenData && tokenData.tokens ) {
					token = tokenData.tokens.edittoken;
					if ( token && token !== '+\\' ) { // ensure not anonymous..
						doUpload( token );
					} else {
						result.reject( 'Anonymous or absent token' );
					}
				} else {
					result.reject( 'Missing token' );
				}
			}, endpoint );

			return result;
		}
	} );

	$.extend( PhotoApi.prototype, EventEmitter.prototype );

	PhotoUploaderPreview = View.extend( {
		defaults: {
			loadingMessage: mw.msg( 'mobile-frontend-image-loading' ),
			license: mw.msg( 'mobile-frontend-photo-license' ),
			cancelButton: mw.msg( 'mobile-frontend-photo-cancel' ),
			submitButton: mw.msg( 'mobile-frontend-photo-submit' ),
			descriptionPlaceholder: mw.msg( 'mobile-frontend-photo-caption-placeholder' ),
			ownerStatement: mw.msg( 'mobile-frontend-photo-ownership', mw.config.get( 'wgUserName' ) )
		},

		template: M.template.get( 'photoUploadPreview' ),

		initialize: function() {
			var self = this,
				$description = this.$( 'textarea' ),
				$submitButton = this.$( 'button.submit' );
			this.$description = $description;

			// make license links open in separate tabs
			this.$( '.license a' ).attr( 'target', '_blank' );

			// use input event too, Firefox doesn't fire keyup on many devices:
			// https://bugzilla.mozilla.org/show_bug.cgi?id=737658
			$description.on( 'keyup input', function() {
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

		setImageUrl: function( url ) {
			this.imageUrl = url;
			this.$( '.loading' ).remove();
			$( '<img>' ).attr( 'src', url ).prependTo( this.$( '.photoPreview' ) );
		}
	} );

	LeadPhoto = View.extend( {
		template: M.template.get( 'leadPhoto' ),

		animate: function() {
			this.$el.hide().slideDown();
		}
	} );

	PhotoUploadProgress = View.extend( {
		defaults: {
			waitMessage: mw.msg( 'mobile-frontend-image-uploading-wait' ),
			cancelMessage: mw.msg( 'mobile-frontend-image-uploading-cancel' ),
			messageInterval: 10000
		},

		template: (
			'<p class="wait">{{waitMessage}}</p>' +
			'<p class="cancel">{{{cancelMessage}}}</p>'
		),

		initialize: function( options ) {
			var self = this, longMessage = false;

			this.$( 'a' ).on( 'click', function() {
				popup.close( true );
				self.emit( 'cancel' );
				return false;
			} );

			setInterval( function() {
				if ( longMessage ) {
					self.$( '.wait' ).text( mw.msg( 'mobile-frontend-image-uploading-wait' ) );
				} else {
					self.$( '.wait' ).text( mw.msg( 'mobile-frontend-image-uploading-long' ) );
				}
				longMessage = !longMessage;
			}, options.messageInterval );
		},

		setValue: function( value ) {
			// only add progress bar if we're getting progress events
			if ( !this.progressBar ) {
				this.progressBar = new ProgressBar();
				this.progressBar.appendTo( this.$el );
			}
			this.progressBar.setValue( value );
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
		template: M.template.get( 'photoUploader' ),
		className: 'button photo',

		initialize: function( options ) {
			var self = this, $input = this.$( 'input' );

			this.options = options;
			this.log = getLog( options.funnel );

			$input.
				// accept must be set via attr otherwise cannot use camera on Android
				attr( 'accept', 'image/*;' ).
				on( 'change', function() {
					var preview = self.preview = new PhotoUploaderPreview(),
						fileReader = new FileReader();

					self.file = $input[0].files[0];
					// clear so that change event is fired again when user selects the same file
					$input.val( '' );

					self.log( { action: 'preview' } );
					preview.
						on( 'cancel', function() {
							self.log( { action: 'previewCancel' } );
							nav.closeOverlay();
						} ).
						on( 'submit', function() {
							self.log( { action: 'previewSubmit' } );
							self._submit();
						} );

					// FIXME: replace if we make overlay an object (and inherit from it?)
					nav.createOverlay( null, preview.$el );
					// skip the URL bar if possible
					window.scrollTo( 0, 1 );

					fileReader.readAsDataURL( self.file );
					fileReader.onload = function() {
						var dataUrl = fileReader.result;
						// add mimetype if not present (some browsers need it, e.g. Android browser)
						dataUrl = dataUrl.replace( /^data:base64/, 'data:image/jpeg;base64' );
						preview.setImageUrl( dataUrl );
					};
				} );
		},

		_submit: function() {
			var self = this,
				description = this.preview.getDescription(),
				api = new PhotoApi(),
				progressPopup = new PhotoUploadProgress();

			this.emit( 'start' );
			nav.closeOverlay();
			popup.show( progressPopup.$el, 'locked noButton loading' );
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
				popup.close();
				self.log( { action: 'success' } );
				self.emit( 'success', {
					fileName: fileName,
					description: description,
					descriptionUrl: descriptionUrl,
					url: self.preview.imageUrl
				} );
			} ).fail( function( err, msg ) {
				popup.show( msg || mw.msg( 'mobile-frontend-photo-upload-error' ), 'toast error' );
				self.log( { action: 'error', errorText: err } );
				self.emit( 'error' );
			} );

			api.on( 'progress', function( value ) {
				progressPopup.setValue( value );
			} );
		}
	} );

	function initialize() {
		// FIXME: make some general function for that (or a page object with a method)
		var namespaceIds = mw.config.get( 'wgNamespaceIds' ),
			namespace = mw.config.get( 'wgNamespaceNumber' ),
			validNamespace = ( namespace === namespaceIds[''] || namespace === namespaceIds.user ),
			$page = $( '#content' ),
			$pageHeading = $page.find( 'h1' ),
			photoUploader;

		if ( !validNamespace || mw.util.getParamValue( 'action' ) || !needsPhoto( $page ) ) {
			return;
		}

		photoUploader = new PhotoUploader( {
			buttonCaption: mw.msg( 'mobile-frontend-photo-upload' ),
			insertInPage: true,
			pageTitle: mw.config.get( 'wgTitle' ),
			funnel: 'article'
		} ).
			insertAfter( $pageHeading ).
			on( 'start', function() {
				photoUploader.detach();
			} ).
			on( 'success', function( data ) {
				popup.show( mw.msg( 'mobile-frontend-photo-upload-success-article' ), 'toast' );
				new LeadPhoto( {
					url: data.url,
					pageUrl: data.descriptionUrl,
					caption: data.description
				} ).insertAfter( $pageHeading ).animate();
			} ).
			on( 'error cancel', function() {
				photoUploader.insertAfter( $pageHeading );
			} );
	}

	if ( isSupported() && mw.config.get( 'wgIsPageEditable' ) ) {
		// FIXME: https://bugzilla.wikimedia.org/show_bug.cgi?id=45299
		if ( M.history.isDynamicPageLoadEnabled ) {
			M.on( 'page-loaded', initialize );
		} else if ( !mw.config.get( 'wgIsMainPage' ) ) {
			$( initialize );
		}
	}

	M.define( 'photo', {
		generateFileName: generateFileName,
		isSupported: isSupported,
		PhotoUploader: PhotoUploader,
		trimUtf8String: trimUtf8String,
		// just for testing
		_needsPhoto: needsPhoto,
		_PhotoUploadProgress: PhotoUploadProgress
	} );

}( mw.mobileFrontend, jQuery ) );
