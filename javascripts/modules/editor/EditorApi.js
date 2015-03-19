( function ( M, $ ) {
	var EditorApi,
		Api = M.require( 'api' ).Api;

	/**
	 * API that helps save and retrieve page content
	 * @class EditorApi
	 * @extends Api
	 */
	EditorApi = Api.extend( {
		/**
		 * @inheritdoc
		 * @param {Object} options
		 * @param {String} options.title the title to edit
		 * @param {Number} options.sectionId the id of the section to operate edits on.
		 * @param {Number} [options.oldId] revision to operate on. If absent defaults to latest.
		 * @param {Boolean} [options.isNewPage] whether the page being created is new
		 */
		initialize: function ( options ) {
			Api.prototype.initialize.apply( this, arguments );
			this.title = options.title;
			this.sectionId = options.sectionId;
			this.oldId = options.oldId;
			// return an empty section for new pages
			this.content = options.isNewPage ? '' : undefined;
			this.hasChanged = false;
		},

		/**
		 * Get the content of a page.
		 * @method
		 * @returns {jQuery.Deferred}
		 */
		getContent: function () {
			var options,
				self = this,
				result = $.Deferred();

			if ( this.content !== undefined ) {
				result.resolve( this.content );
			} else {
				options = {
					action: 'query',
					prop: 'revisions',
					rvprop: [ 'content', 'timestamp' ],
					titles: this.title
				};
				// Load text of old revision if desired
				if ( this.oldId ) {
					options.rvstartid = this.oldId;
				}
				// See Bug 50136 - passing rvsection will fail with non wikitext
				if ( $.isNumeric( this.sectionId ) ) {
					options.rvsection = this.sectionId;
				}
				this.get( options ).done( function ( resp ) {
					var revision, pageObj;

					if ( resp.error ) {
						result.reject( resp.error.code );
						return;
					}

					// FIXME: MediaWiki API, seriously?
					pageObj = $.map( resp.query.pages, function ( page ) {
						return page;
					} )[0];

					// page might not exist and caller might not have known.
					// FIXME: API - missing is set to empty string (face palm)
					if ( pageObj.missing !== undefined ) {
						self.content = '';
					} else {
						revision = pageObj.revisions[0];
						self.content = revision['*'];
						self.timestamp = revision.timestamp;
					}
					// save content a second time to be able to check for changes
					self.originalContent = self.content;

					result.resolve( self.content );
				} );
			}

			return result;
		},

		/**
		 * Mark content as modified and set changes to be submitted when #save
		 * is invoked.
		 * @method
		 * @param {String} content New section content.
		 */
		setContent: function ( content ) {
			if ( this.originalContent !== content ) {
				this.hasChanged = true;
			} else {
				this.hasChanged = false;
			}
			this.content = content;
		},

		/**
		 * Mark content as modified and set text that should be prepended to given
		 * section when #save is invoked.
		 * @method
		 * @param {String} text Text to be prepended.
		 */
		setPrependText: function ( text ) {
			this.prependtext = text;
			this.hasChanged = true;
		},

		/**
		 * Save the new content of the section, previously set using #setContent.
		 * @method
		 * @param {Object} options
		 *      [options.summary] String Optional summary for the edit.
		 *     [options.captchaId] String If CAPTCHA was requested, ID of the
		 * captcha.
		 *     [options.captchaWord] String If CAPTCHA was requested, term
		 * displayed in the CAPTCHA.
		 * @return {jQuery.Deferred} On failure callback is passed an object with
		 * `type` and `details` properties. `type` is a string describing the type
		 * of error, `details` can be any object (usually error message).
		 */
		save: function ( options ) {
			var self = this,
				result = $.Deferred();

			options = options || {};

			/**
			 * Save content. Make an API request.
			 * @ignore
			 */
			function saveContent() {
				var apiOptions = {
					action: 'edit',
					title: self.title,
					summary: options.summary,
					captchaid: options.captchaId,
					captchaword: options.captchaWord,
					basetimestamp: self.timestamp,
					starttimestamp: self.timestamp
				};

				if ( self.content !== undefined ) {
					apiOptions.text = self.content;
				} else if ( self.prependtext ) {
					apiOptions.prependtext = self.prependtext;
				}

				if ( $.isNumeric( self.sectionId ) ) {
					apiOptions.section = self.sectionId;
				}

				self.postWithToken( 'edit', apiOptions ).done( function ( data ) {
					var code, warning;

					if ( data && data.edit && data.edit.result === 'Success' ) {
						self.hasChanged = false;
						result.resolve();
					} else if ( data && data.error ) {
						// Edit API error
						result.reject( {
							type: 'error',
							details: data.error.code
						} );
					} else if ( data && data.edit && data.edit.captcha ) {
						// CAPTCHAs
						result.reject( {
							type: 'captcha',
							details: data.edit.captcha
						} );
					} else if ( data && data.edit && data.edit.code ) {
						code = data.edit.code;
						warning = data.edit.warning;

						// FIXME: AbuseFilter should have more consistent API responses
						if ( /^abusefilter-warning/.test( code ) ) {
							// AbuseFilter warning
							result.reject( {
								type: 'abusefilter',
								details: {
									type: 'warning',
									message: warning
								}
							} );
						} else if ( /^abusefilter-disallow/.test( code ) ) {
							// AbuseFilter disallow
							result.reject( {
								type: 'abusefilter',
								details: {
									type: 'disallow',
									message: warning
								}
							} );
						} else if ( /^abusefilter/.test( code ) ) {
							// AbuseFilter other
							result.reject( {
								type: 'abusefilter',
								details: {
									type: 'other',
									message: warning
								}
							} );
						} else {
							// other errors
							result.reject( {
								type: 'error',
								details: code
							} );
						}
					} else {
						result.reject( {
							type: 'error',
							details: 'unknown'
						} );
					}
				} ).fail( $.proxy( result, 'reject', {
					type: 'error',
					details: 'http'
				} ) );
			}

			saveContent();
			return result;
		},

		/**
		 * Get page preview from the API
		 * @method
		 * @param {Object} options API query parameters
		 * @returns {jQuery.Deferred}
		 */
		getPreview: function ( options ) {
			var result = $.Deferred(),
				sectionLine = '',
				self = this;

			$.extend( options, {
				action: 'parse',
				// Enable section preview mode to avoid errors (bug 49218)
				sectionpreview: true,
				// needed for pre-save transform to work (bug 53692)
				pst: true,
				// Output mobile HTML (bug 54243)
				mobileformat: true,
				title: this.title,
				prop: [ 'text', 'sections' ]
			} );

			this.post( options ).done( function ( resp ) {
				if ( resp && resp.parse && resp.parse.text ) {
					// section 0 haven't a section name so skip
					if ( self.sectionId !== 0 &&
						resp.parse.sections !== undefined &&
						resp.parse.sections[0] !== undefined &&
						resp.parse.sections[0].line !== undefined
					) {
						sectionLine = resp.parse.sections[0].line;
					}
					result.resolve( resp.parse.text['*'], sectionLine );
				} else {
					result.reject();
				}
			} ).fail( $.proxy( result, 'reject' ) );

			return result;
		}
	} );

	M.define( 'modules/editor/EditorApi', EditorApi );

}( mw.mobileFrontend, jQuery ) );
