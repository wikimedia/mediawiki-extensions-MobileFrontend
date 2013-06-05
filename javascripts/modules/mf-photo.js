( function( M, $ ) {

	var View = M.require( 'view' ),
		Api = M.require( 'api' ).Api,
		CtaDrawer = M.require( 'CtaDrawer' ),
		funnel = $.cookie( 'mwUploadsFunnel' ) || 'article',
		showCta = mw.config.get( 'wgMFEnablePhotoUploadCTA' ) || funnel === 'nearby',
		EventEmitter = M.require( 'eventemitter' ),
		ProgressBar = M.require( 'widgets/progress-bar' ),
		Overlay = M.require( 'Overlay' ),
		ownershipMessage = mw.msg( 'mobile-frontend-photo-ownership', mw.config.get( 'wgUserName' ), mw.user ),
		popup = M.require( 'notifications' ),
		endpoint = mw.config.get( 'wgMFPhotoUploadEndpoint' ),
		apiUrl = endpoint || M.getApiUrl(),
		PhotoApi, LearnMoreOverlay, NagOverlay, PhotoUploaderPreview, LeadPhoto,
		PhotoUploadProgress, PhotoUploader, PhotoUploaderButton, PhotoUploaderPageActionButton;

	function needsPhoto( $container ) {
		var $content_0 = $container.find( '#content_0' );
		// FIXME: workaround for https://bugzilla.wikimedia.org/show_bug.cgi?id=43271
		if ( $content_0.length ) {
			$container = $content_0;
		}

		return $container.find( mw.config.get( 'wgMFLeadPhotoUploadCssSelector' ) ).length === 0;
	}

	// reset the funnel cookie as it is no longer valid (this stops upload cta showing on further page loads)
	if ( funnel ) {
		$.cookie( 'mwUploadsFunnel', null );
	}

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
			name, suffix;

		fileSuffix = fileSuffix || '.jpg';
		date = date || new Date();
		name = description.replace( /[\x1B\n\x7f\.\[#<>\[\]\|\{\}\/:]/g, '-' );

		function pad( number ) {
			return number < 10 ? '0' + number : number;
		}

		suffix = ' ' + date.getFullYear() + '-' +
			pad( date.getMonth() + 1 ) + '-' + pad( date.getDate() ) + ' ' +
			pad( date.getHours() ) + '-' + pad( date.getMinutes() ) + fileSuffix;

		allowedLength -= suffix.length;
		return trimUtf8String( name, allowedLength ) + suffix;
	}

	PhotoApi = Api.extend( {
		updatePage: function( options, callback ) {
			var self = this;
			self.getToken().done( function( token ) {
				self.post( {
					action: 'edit',
					title: options.pageTitle,
					token: token,
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
				var formData = new FormData(),
					ext = options.file.name.slice( options.file.name.lastIndexOf( '.' ) + 1 );

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
				formData.append( 'text', M.template.get( 'wikitext/commons-upload' ).
					render( {
						suffix: mw.config.get( 'wgMFPhotoUploadAppendToDesc' ),
						text: options.description,
						username: mw.config.get( 'wgUserName' )
					} )
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
					if ( !options.fileName ) {
						return result.reject( 'Missing filename' );
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
			self.getToken( 'edit', endpoint ).done( function( token ) {
				doUpload( token );
			} ).fail( function( err ) {
				result.reject( err );
			} );

			return result;
		}
	} );

	$.extend( PhotoApi.prototype, EventEmitter.prototype );

	LearnMoreOverlay = Overlay.extend( {
		defaults: {
			confirmMessage: mw.msg( 'mobile-frontend-photo-ownership-confirm' )
		},
		template: M.template.get( 'overlays/learnMore' )
	} );

	NagOverlay = Overlay.extend( {
		defaults: {
			learnMore: mw.msg( 'parentheses', mw.msg( 'mobile-frontend-learn-more' ) )
		},

		template: M.template.get( 'photoNag' ),

		initialize: function( options ) {
			var self = this, $checkboxes = this.$( 'input[type=checkbox]' ),
				learnMoreOverlay;

			this._super( options );

			function disable( $checkbox ) {
				$checkbox.prop( 'disabled', true );
				$checkbox.parent().removeClass( 'active' );
			}

			function enable( $checkbox ) {
				$checkbox.prop( 'disabled', false );
				$checkbox.parent().addClass( 'active' );
			}

			learnMoreOverlay = new LearnMoreOverlay( {
				parent: self,
				heading: mw.msg( 'mobile-frontend-photo-nag-learn-more-heading' ),
				bulletPoints: [
					mw.msg( 'mobile-frontend-photo-nag-learn-more-1' ),
					mw.msg( 'mobile-frontend-photo-nag-learn-more-2' ),
					mw.msg( 'mobile-frontend-photo-nag-learn-more-3' )
				]
			} );
			self.$( 'li button' ).on( 'click', $.proxy( learnMoreOverlay, 'show' ) );

			disable( $checkboxes.not( ':first' ) );
			enable( $checkboxes.eq( 0 ) );

			$checkboxes.on( 'click', function() {
				var $checkbox = $( this ), $next;
				$checkbox.parent().addClass( 'checked' );
				$next = $checkboxes.not( ':checked' ).eq( 0 );
				disable( $checkbox );
				if ( !$next.length ) {
					self.emit( 'confirm' );
				} else {
					enable( $next );
				}
			} );
		},

		setImageUrl: function( url ) {
			this.$( '.preview' ).
				removeClass( 'loading' ).
				css( 'background-image', 'url(' + url + ')' );
		}
	} );

	PhotoUploaderPreview = View.extend( {
		defaults: {
			loadingMessage: mw.msg( 'mobile-frontend-image-loading' ),
			license: mw.msg( 'mobile-frontend-photo-license' ),
			cancelButton: mw.msg( 'mobile-frontend-photo-cancel' ),
			submitButton: mw.msg( 'mobile-frontend-photo-submit' ),
			descriptionPlaceholder: mw.msg( 'mobile-frontend-photo-caption-placeholder' ),
			help: mw.msg( 'mobile-frontend-photo-ownership-help' ),
			ownerStatement: ownershipMessage
		},

		template: M.template.get( 'photoUploadPreview' ),

		initialize: function( options ) {
			var self = this,
				$overlay, $description, $submitButton;

			this.log = options.log;
			this.overlay = new Overlay( {
				content: $( '<div>' ).html( this.$el ).html()
			} );
			$overlay = this.overlay.$el;

			$description = $overlay.find( 'textarea' );
			$submitButton = $overlay.find( 'button.submit' );
			this.$description = $description;

			// make license links open in separate tabs
			$overlay.find( '.license a' ).attr( 'target', '_blank' );
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
			$overlay.find( 'button.cancel' ).on( 'click', function() {
				self.emit( 'cancel' );
			} );
		},

		getDescription: function() {
			return this.$description.val();
		},

		setImageUrl: function( url ) {
			var self = this;
			this.imageUrl = url;
			this.overlay.$( '.loading' ).remove();
			this.overlay.$( 'a.help' ).on( 'click', function( ev ) {
				ev.preventDefault(); // avoid setting #
				var overlay = new LearnMoreOverlay( {
					parent: self.overlay,
					bulletPoints: [
						mw.msg( 'mobile-frontend-photo-ownership-bullet-one' ),
						mw.msg( 'mobile-frontend-photo-ownership-bullet-two' ),
						mw.msg( 'mobile-frontend-photo-ownership-bullet-three' )
					],
					leadText: ownershipMessage
				} );
				overlay.show();
				self.log( { action: 'whatDoesThisMean' } );
			} );
			$( '<img>' ).attr( 'src', url ).prependTo( this.overlay.$( '.photoPreview' ) );
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

		initialize: function( options ) {
			var self = this, $input = this.$( 'input' ), ctaDrawer;

			this.options = options;
			this.log = getLog( options.funnel );

			// show CTA instead if not logged in
			if ( !M.isLoggedIn() ) {
				ctaDrawer = new CtaDrawer( {
					content: mw.msg( 'mobile-frontend-photo-upload-cta' ),
					returnToQuery: 'article_action=photo-upload'
				} );
				this.$el.click( function( ev ) {
					if ( !ctaDrawer.isVisible() ) {
						ctaDrawer.show();
					} else {
						ctaDrawer.hide();
					}
					ev.preventDefault();
					ev.stopPropagation();
				} );
				return;
			}

			$input.
				// accept must be set via attr otherwise cannot use camera on Android
				attr( 'accept', 'image/*;' ).
				on( 'change', function() {
					var nagCount = parseInt( M.settings.getUserSetting( 'uploadNagCount' ) || 0, 10 ),
						shouldNag = (
							mw.config.get( 'wgMFMode' ) !== 'stable' &&
							parseInt( mw.config.get( 'wgUserEditCount' ), 10 ) < 3
						),
						fileReader = new FileReader(), nagOverlay;

					self.preview = new PhotoUploaderPreview( { log: self.log } );

					self.file = $input[0].files[0];
					// clear so that change event is fired again when user selects the same file
					$input.val( '' );

					// nag if never nagged and shouldNag and then keep nagging (3 times)
					if ( ( nagCount === 0 && shouldNag ) || ( nagCount > 0 && nagCount < 3 ) ) {
						// FIXME: possibly set self.preview.parent = nagOverlay when nagOverlay is present
						// and when PhotoUploaderPreview is rewritten as an overlay
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
					nagMessages = $.map( [1, 2], function( val ) {
						// Give grep a chance to find the usages:
						// mobile-frontend-photo-nag-1-bullet-1-heading, mobile-frontend-photo-nag-1-bullet-2-heading,
						// mobile-frontend-photo-nag-1-bullet-1-text, mobile-frontend-photo-nag-1-bullet-2-text
						return {
							heading: mw.msg( 'mobile-frontend-photo-nag-1-bullet-' + val + '-heading' ),
							text: mw.msg( 'mobile-frontend-photo-nag-1-bullet-' + val + '-text' )
						};
					} );
					break;

				case 1:
				case 2:
					// Give grep a chance to find the usages:
					// mobile-frontend-photo-nag-2-bullet-1-heading, mobile-frontend-photo-nag-3-bullet-1-heading
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

			self.preview.overlay.show();
			// skip the URL bar if possible
			window.scrollTo( 0, 1 );
		},

		_submit: function() {
			var self = this,
				description = this.preview.getDescription(),
				api = new PhotoApi(),
				progressPopup = new PhotoUploadProgress();

			this.emit( 'start' );
			this.preview.overlay.hide();
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

	PhotoUploaderPageActionButton = PhotoUploader.extend( {
		template: M.template.get( 'photoUploadAction' ),
		className: 'enabled'
	} );

	// An extension of the PhotoUploader which instead of treating it as a button treats it as a full screen bar
	PhotoUploaderButton = PhotoUploader.extend( {
		template: M.template.get( 'photoUploader' ),
		className: 'button photo'
	} );

	function initialize() {
		// FIXME: make some general function for that (or a page object with a method)
		var namespaceIds = mw.config.get( 'wgNamespaceIds' ),
			namespace = mw.config.get( 'wgNamespaceNumber' ),
			validNamespace = ( namespace === namespaceIds[''] || namespace === namespaceIds.user ),
			$page = $( '#content' ),
			$pageHeading = $page.find( 'h1' ).first(),
			optionsPhotoUploader,
			photoUploader;

		if ( !validNamespace || mw.util.getParamValue( 'action' ) || !needsPhoto( $page ) || mw.config.get( 'wgIsMainPage' ) ) {
			return;
		}

		optionsPhotoUploader = {
			buttonCaption: mw.msg( 'mobile-frontend-photo-upload' ),
			insertInPage: true,
			pageTitle: mw.config.get( 'wgTitle' ),
			funnel: funnel
		};

		if ( $( '#ca-upload' ).length ) {
			optionsPhotoUploader.el = '#ca-upload';
			photoUploader = new PhotoUploaderPageActionButton( optionsPhotoUploader );
		// FIXME: Remove else clause when page actions go to stable
		} else {
			photoUploader = new PhotoUploaderButton( optionsPhotoUploader ).insertAfter( $pageHeading );
		}
		photoUploader.on( 'start', function() {
				photoUploader.$el.hide();
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
				} ).prependTo( '#content_0' ).animate();
			} ).
			on( 'error cancel', function() {
				photoUploader.$el.show();
			} );
	}

	if (
		isSupported() && mw.config.get( 'wgIsPageEditable' ) &&
		( M.isLoggedIn() || showCta )
	) {
		$( initialize );
		M.on( 'page-loaded', function() {
			initialize();
		} );
	}

	M.define( 'photo', {
		PhotoApi: PhotoApi,
		generateFileName: generateFileName,
		isSupported: isSupported,
		PhotoUploader: PhotoUploader,
		PhotoUploaderButton: PhotoUploaderButton,
		trimUtf8String: trimUtf8String,
		// just for testing
		_needsPhoto: needsPhoto,
		_PhotoUploadProgress: PhotoUploadProgress
	} );

}( mw.mobileFrontend, jQuery ) );
