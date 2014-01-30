( function( M, $ ) {
	var Api = M.require( 'api' ).Api,
		user = M.require( 'user' ),
		endpoint = mw.config.get( 'wgMFPhotoUploadEndpoint' ),
		PhotoApi;

	// Originally written by Brion for WikiLovesMonuments app
	function trimUtf8String( str, allowedLength ) {
		// Count UTF-8 bytes to see where we need to crop long names.
		var bytes = 0, chars = 0, codeUnit, len, i;

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
	 * @param {String} description: Data to be preprocessed and added to options
	 * @param {String} suffix: An optional file extension e.g. '.jpg' or '.gif'
	 * @param {Date} date: An optional date (defaults to current date)
	 * @return {String} a legal filename
	 */
	function generateFileName( description, fileSuffix, date ) {
		// 240 bytes maximum enforced by MediaWiki - allow 10bytes margin of error
		var allowedLength = 230,
			name, suffix;

		fileSuffix = fileSuffix || '.jpg';
		date = date || new Date();
		name = description.replace( /[\x1B\n\x7f\.\[#<>\[\]\|\{\}\/:]/g, '-' );
		// https://commons.wikimedia.org/wiki/MediaWiki:Titleblacklist-custom-double-apostrophe
		name = name.replace( /''/g, '\'_' );

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
		useCentralAuthToken: mw.config.get( 'wgMFUseCentralAuthToken' ),

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

		// FIXME: See UploadBase::checkWarnings - why these are not errors only the MediaWiki Gods know See Bug 48261
		_handleWarnings: function( result, warnings ) {
			var errorMsg = 'Missing filename: ', humanErrorMsg;
			if ( warnings.exists ) {
				errorMsg += 'Filename exists';
				humanErrorMsg = mw.msg( 'mobile-frontend-photo-upload-error-filename' );
			} else if ( warnings.badfilename ) {
				errorMsg = 'Bad filename: [' + warnings.badfilename + ']';
			} else if ( warnings.emptyfile ) {
				errorMsg += 'Empty file';
			} else if ( warnings['filetype-unwanted-type'] ) {
				errorMsg += 'Bad filetype';
			} else if ( warnings['duplicate-archive'] ) {
				errorMsg += 'Duplicate archive';
			} else if ( warnings['large-file'] ) {
				errorMsg += 'Large file';
			} else {
				errorMsg += 'Unknown warning ' + $.toJSON( warnings );
			}

			return result.reject( errorMsg, humanErrorMsg );
		},

		save: function( options ) {
			var self = this, result = $.Deferred(), apiUrl = endpoint || this.apiUrl;

			options.editSummaryMessage = options.insertInPage ?
				'mobile-frontend-photo-article-edit-comment' :
				'mobile-frontend-photo-article-donate-comment';

			function doUpload( token, caToken ) {
				var formData = new FormData(),
					uploadUrl = apiUrl + '?useformat=mobile&r=' + Math.random(),
					ext = options.file.name.slice( options.file.name.lastIndexOf( '.' ) + 1 ),
					request;

				options.fileName = generateFileName( options.description, '.' + ext );

				formData.append( 'action', 'upload' );
				formData.append( 'format', 'json' );
				// add origin only when doing CORS
				if ( endpoint ) {
					uploadUrl += '&origin=' + M.getOrigin();
					if ( caToken ) {
						formData.append( 'centralauthtoken', caToken );
					}
				}
				formData.append( 'filename', options.fileName );
				formData.append( 'comment', mw.msg( options.editSummaryMessage ) );
				formData.append( 'file', options.file );
				formData.append( 'token', token );
				formData.append( 'text', M.template.get( 'wikitext/commons-upload' ).
					render( {
						suffix: mw.config.get( 'wgMFPhotoUploadAppendToDesc' ),
						text: options.description,
						username: user.getName()
					} )
				);

				request = self.post( formData, {
					// iOS seems to ignore the cache parameter so sending r parameter
					// send useformat=mobile for sites where endpoint is a desktop url so that they are mobile edit tagged
					url: uploadUrl,
					xhrFields: { 'withCredentials': true },
					cache: false,
					contentType: false,
					processData: false
				} ).done( function( data ) {
					var descriptionUrl = '',
						warnings = data.upload ? data.upload.warnings : false,
						err = '';
					if ( !data || !data.upload ) {
						// error uploading image
						if ( data.error ) {
							if ( data.error.code ) {
								err += data.error.code;
							}
							if ( data.error.details && data.error.details[0] ) {
								err += ' ' + data.error.details[0];
							}
						}
						result.reject( err );
						return;
					}
					options.fileName = data.upload.filename;
					if ( !options.fileName ) {
						if ( warnings && warnings.duplicate ) {
							options.fileName = warnings.duplicate[ '0' ];
						} else if ( warnings ) {
							return self._handleWarnings( result, warnings );
						} else {
							return result.reject( 'Missing filename: ' + $.toJSON( data.upload ) );
						}
					}
					// FIXME: API doesn't return this information on duplicate images...
					if ( data.upload.imageinfo ) {
						descriptionUrl = data.upload.imageinfo.descriptionurl;
					}
					if ( options.insertInPage ) {
						// FIXME: refactor EditorApi and use it here instead
						self.updatePage( options, function( data ) {
							var code;

							if ( data && data.edit && data.edit.result === 'Success' ) {
								result.resolve( options.fileName, descriptionUrl );
							} else if ( data && data.error ) {
								// Edit API error
								result.reject( data.error.code );
							} else if ( data && data.edit && data.edit.captcha ) {
								// CAPTCHAs
								result.reject( 'captcha' );
							} else if ( data && data.edit && data.edit.code ) {
								code = data.edit.code;
								// AbuseFilter
								if ( /^abusefilter/.test( code ) ) {
									result.reject( 'abusefilter' );
								} else {
									result.reject( code );
								}
							} else {
								result.reject( 'unknown error' );
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

				self.on( 'progress', function( req, progress ) {
					if ( req === request ) {
						self.emit( 'uploadProgress', progress );
					}
				} );
			}

			function getToken() {
				return self.getToken.apply( self, arguments ).fail( $.proxy( result, 'reject' ) );
			}

			if ( self.useCentralAuthToken && endpoint ) {
				// get caToken for obtaining the edit token from external wiki (the one we want to upload to)
				getToken( 'centralauth' ).done( function( caTokenForEditToken ) {
					// request edit token using the caToken
					getToken( 'edit', endpoint, caTokenForEditToken ).done( function( token ) {
						// tokens are only valid for one go so let's get another one for the upload itself
						getToken( 'centralauth' ).done( function( caTokenForUpload ) {
							doUpload( token, caTokenForUpload );
						} );
					} );
				} );
			} else {
				getToken( 'edit', endpoint ).done( doUpload );
			}

			return result;
		}
	} );

	M.define( 'modules/uploads/PhotoApi', PhotoApi );
	M.define( 'modules/uploads/_photo', {
		generateFileName: generateFileName,
		trimUtf8String: trimUtf8String
	} );

}( mw.mobileFrontend, jQuery ) );
