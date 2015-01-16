( function ( M, $ ) {
	var Api, PhotoApi,
		user = M.require( 'user' ),
		endpoint = mw.config.get( 'wgMFPhotoUploadEndpoint' );

	if ( endpoint ) {
		Api = M.require( 'modules/ForeignApi' );
	} else {
		Api = M.require( 'api' ).Api;
	}

	/**
	 * Originally written by Brion for WikiLovesMonuments app, trims a string
	 * to a certain number of bytes
	 *
	 * @param {String} str
	 * @param {Number} allowedLength in bytes
	 * @ignore
	 */
	function trimUtf8String( str, allowedLength ) {
		// Count UTF-8 bytes to see where we need to crop long names.
		var codeUnit, len, i,
			bytes = 0,
			chars = 0;

		for ( i = 0; i < str.length; i++ ) {
			// JavaScript strings are UTF-16.
			codeUnit = str.charCodeAt( i );

			// https://en.wikipedia.org/wiki/UTF-8#Description
			if ( codeUnit < 0x80 ) {
				len = 1;
			} else if ( codeUnit < 0x800 ) {
				len = 2;
			} else if ( codeUnit >= 0xd800 && codeUnit < 0xe000 ) {
				// https://en.wikipedia.org/wiki/UTF-16#Description
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
	 * @param {String} description Data to be preprocessed and added to options
	 * @param {String} fileSuffix An optional file extension e.g. '.jpg' or '.gif'
	 * @param {Date} date An optional date (defaults to current date)
	 * @return {String} a legal filename
	 * @ignore
	 */
	function generateFileName( description, fileSuffix, date ) {
		// 240 bytes maximum enforced by MediaWiki - allow 10bytes margin of error
		var allowedLength = 230,
			name, suffix;

		fileSuffix = fileSuffix || '.jpg';
		date = date || new Date();
		name = description.replace( /[\x1B\n\x7f\.\[#<>\[\]\|\{\}\/:]/g, '-' );
		// remove double spaces (bug 62241)
		// also trim it in case it ends with a double space
		name = $.trim( name ).replace( /  /g, ' ' );
		// https://commons.wikimedia.org/wiki/MediaWiki:Titleblacklist-custom-double-apostrophe
		name = name.replace( /''/g, '\'_' );

		/**
		 * Pad single digit numbers with leading 0.
		 * @param {Number} number
		 * @ignore
		 * @returns {Number|String} representing number with at least 2 digits
		 */
		function pad( number ) {
			return number < 10 ? '0' + number : number;
		}

		suffix = ' ' + date.getUTCFullYear() + '-' +
			pad( date.getUTCMonth() + 1 ) + '-' + pad( date.getUTCDate() ) + ' ' +
			pad( date.getUTCHours() ) + '-' + pad( date.getUTCMinutes() ) + fileSuffix;

		allowedLength -= suffix.length;
		return trimUtf8String( name, allowedLength ) + suffix;
	}

	/**
	 * API to handle photo uploads
	 *
	 * @class PhotoApi
	 * @extends Api
	 */
	PhotoApi = Api.extend( {
		/** @inheritdoc */
		apiUrl: endpoint || Api.prototype.apiUrl,

		/**
		 * @inheritdoc
		 * @param {Object} options
		 *     [options.editorApi] EditorApi An API instance that will be used
		 *     [options.page] Page to upload to
		 * for inserting images in a page.
		 */
		initialize: function ( options ) {
			Api.prototype.initialize.apply( this, arguments );
			options = options || {};
			this.page = options.page;
			this.editorApi = options.editorApi;
		},

		/**
		 * Applies special handling for uploads which fail due to a lack of filename.
		 * Scans the warnings and tries to construct a suitable error message.
		 * FIXME: See UploadBase::checkWarnings - why these are not errors only the MediaWiki Gods know See Bug 48261
		 * @private
		 * @param {jQuery.Deferred} result from an upload api request.
		 * @param {Object} warnings as found in the data.upload.warnings.
		 *  FIXME: This is part of the result and thus is an unnecessary parameter.
		 */
		_handleWarnings: function ( result, warnings ) {
			var humanErrorMsg,
				err = {
					stage: 'upload',
					type: 'warning'
				};

			warnings = $.map( warnings, function ( value, code ) {
				return code + '/' + value;
			} );
			err.details = warnings[0] || 'unknown';

			if ( warnings.exists ) {
				humanErrorMsg = mw.msg( 'mobile-frontend-photo-upload-error-filename' );
			}

			return result.reject( err, humanErrorMsg );
		},

		/**
		 * Upload an image and, optionally, add it to current page (if PhotoApi
		 * was initialized with `editorApi`).
		 *
		 * @param {Object} options
		 *     options.file File A file object obtained from a file input.
		 *     options.description String Image description.
		 * @return {jQuery.Deferred} On failure callback is passed an object with
		 * `stage`, `type` and `details` properties. `stage` is either "upload"
		 * or "edit" (inserting image in a page). `type` is a string describing
		 * the type of error, `details` can be any object (usually a string
		 * containing error message).
		 */
		save: function ( options ) {
			var page = this.page,
				// FIXME: Use page.getId()
				isNewPage = mw.config.get( 'wgArticleId' ) === 0,
				isNewFile = page.inNamespace( 'file' ) && isNewPage,
				self = this,
				result = $.Deferred();

			options.editSummaryMessage = options.insertInPage ?
				'mobile-frontend-photo-article-edit-comment' :
				'mobile-frontend-photo-article-donate-comment';

			/**
			 * Performs upload
			 *
			 * @ignore
			 */
			function doUpload() {
				var
					ext = options.file.name.slice( options.file.name.lastIndexOf( '.' ) + 1 ),
					request, data;

				if ( !isNewFile ) {
					options.fileName = generateFileName( options.description, '.' + ext );
				} else {
					options.fileName = mw.config.get( 'wgTitle' );
				}

				data = {
					action: 'upload',
					filename: options.fileName,
					comment: mw.msg( options.editSummaryMessage ),
					file: options.file,
					text: mw.template.get( 'mobile.upload.ui', 'template.hogan' )
						.render( {
							suffix: mw.config.get( 'wgMFPhotoUploadAppendToDesc' ),
							text: options.description,
							username: user.getName()
						} )
				};

				request = self.postWithToken( 'edit', data, {
					contentType: 'multipart/form-data',
					cache: false
				} ).done( function ( data ) {
					var descriptionUrl = '',
						warnings = data.upload ? data.upload.warnings : false,
						err = {
							stage: 'upload',
							type: 'error'
						};

					if ( !data || !data.upload ) {
						// error uploading image
						if ( data.error ) {
							if ( data.error.code ) {
								err.details = data.error.code;
								if ( data.error.details && data.error.details[0] ) {
									err.details += '/' + data.error.details[0];
								}
							}
						}
						result.reject( err );
						return;
					}

					options.fileName = data.upload.filename;

					if ( !options.fileName ) {
						// FIXME: Handle this case as an error in handleWarnings
						if ( warnings && warnings.duplicate ) {
							options.fileName = warnings.duplicate[ '0' ];
						} else if ( warnings ) {
							return self._handleWarnings( result, warnings );
						} else {
							return result.reject( {
								stage: 'upload',
								type: 'unknown',
								details: 'missing-filename'
							} );
						}
					}

					// FIXME: API doesn't return this information on duplicate images...
					if ( data.upload.imageinfo ) {
						descriptionUrl = data.upload.imageinfo.descriptionurl;
					}

					if ( self.editorApi && !isNewFile ) {
						self.editorApi.setPrependText( '[[File:' + options.fileName + '|thumbnail|' + options.description + ']]\n\n' );
						self.editorApi.save( {
								summary: mw.msg( 'mobile-frontend-photo-upload-comment' )
						} )
							.done( function () {
								result.resolve( options.fileName, descriptionUrl );
							} )
							.fail( function ( err ) {
								err.stage = 'edit';
								result.reject( err );
							} );
					} else if ( isNewFile ) {
						window.location.reload();
					} else {
						result.resolve( options.fileName, descriptionUrl );
					}

				} ).fail( function () {
					// error on the server side (abort happens when user cancels the upload)
					if ( status !== 'abort' ) {
						result.reject( {
							stage: 'upload',
							type: 'error',
							details: 'http'
						} );
					}
				} );

				self.on( 'progress', function ( req, progress ) {
					if ( req === request ) {
						self.emit( 'uploadProgress', progress );
					}
				} );
			}
			doUpload();

			return result;
		}
	} );

	M.define( 'modules/uploads/PhotoApi', PhotoApi );
	M.define( 'modules/uploads/_photo', {
		generateFileName: generateFileName,
		trimUtf8String: trimUtf8String
	} );

}( mw.mobileFrontend, jQuery ) );
