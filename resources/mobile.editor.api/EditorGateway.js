( function ( M ) {
	var util = M.require( 'mobile.startup/util' );

	/**
	 * API that helps save and retrieve page content
	 * @class EditorGateway
	 *
	 * @param {Object} options Configuration options
	 * @param {mw.Api} options.api an Api to use.
	 * @param {string} options.title the title to edit
	 * @param {number} options.sectionId the id of the section to operate edits on.
	 * @param {number} [options.oldId] revision to operate on. If absent defaults to latest.
	 * @param {boolean} [options.isNewPage] whether the page being created is new
	 */
	function EditorGateway( options ) {
		this.api = options.api;
		this.title = options.title;
		this.sectionId = options.sectionId;
		this.oldId = options.oldId;
		// return an empty section for new pages
		this.content = options.isNewPage ? '' : undefined;
		this.hasChanged = false;
	}

	EditorGateway.prototype = {
		/**
		 * Get the content of a page.
		 * @memberof EditorGateway
		 * @instance
		 * @return {jQuery.Promise}
		 */
		getContent: function () {
			var options,
				self = this;

			function resolve() {
				return util.Deferred().resolve( {
					text: self.content || '',
					user: self.userinfo,
					block: self.block,
					blockedByUser: self.blockedByUser
				} );
			}

			if ( this.content !== undefined ) {
				return resolve();
			} else {
				options = {
					action: 'query',
					prop: 'revisions',
					rvprop: [ 'content', 'timestamp' ],
					titles: self.title,
					// get block information for this user
					// (meta=userinfo is the only way to find autoblocks,
					// we can't use list=blocks&bkusers/bkip for this)
					meta: 'userinfo',
					uiprop: 'blockinfo',
					formatversion: 2
				};
				// Load text of old revision if desired
				if ( this.oldId ) {
					options.rvstartid = this.oldId;
				}
				// See Bug 50136 - passing rvsection will fail with non wikitext
				if ( util.isNumeric( this.sectionId ) ) {
					options.rvsection = this.sectionId;
				}
				return this.api.get( options ).then( function ( resp ) {
					var revision, pageObj;

					if ( resp.error ) {
						return util.Deferred().reject( resp.error.code );
					}

					pageObj = resp.query.pages[0];
					// page might not exist and caller might not have known.
					if ( pageObj.missing !== undefined ) {
						self.content = '';
					} else {
						revision = pageObj.revisions[0];
						self.content = revision.content;
						self.timestamp = revision.timestamp;
					}
					// save content a second time to be able to check for changes
					self.originalContent = self.content;
					self.userinfo = resp.query.userinfo;
					self.block = null;
					self.blockedByUser = null;

					if ( !self.userinfo.blockid ) {
						return resolve();
					} else {
						// Preload library used by EditorOverlay
						// to format block expiry datetime and duration
						mw.loader.load( 'moment' );

						// Look up additional block information:
						// * Block flags - 'allowusertalk' for talk pages
						// * Blocker's gender for localisation messages
						return self.api.get( {
							list: 'blocks|users',
							bkids: self.userinfo.blockid,
							bkprop: 'by|expiry|reason|flags',
							ususers: self.userinfo.blockedby,
							usprop: 'gender',
							formatversion: 2
						} ).then( function ( resp ) {
							self.block = resp.query.blocks[0];
							self.blockedByUser = resp.query.users[0];

							return resolve();
						} );
					}
				} );
			}
		},

		/**
		 * Mark content as modified and set changes to be submitted when #save
		 * is invoked.
		 * @memberof EditorGateway
		 * @instance
		 * @param {string} content New section content.
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
		 * @memberof EditorGateway
		 * @instance
		 * @param {string} text Text to be prepended.
		 */
		setPrependText: function ( text ) {
			this.prependtext = text;
			this.hasChanged = true;
		},

		/**
		 * Save the new content of the section, previously set using #setContent.
		 * @memberof EditorGateway
		 * @instance
		 * @param {Object} options Configuration options
		 * @param {string} [options.summary] Optional summary for the edit.
		 * @param {string} [options.captchaId] If CAPTCHA was requested, ID of the
		 * captcha.
		 * @param {string} [options.captchaWord] If CAPTCHA was requested, term
		 * displayed in the CAPTCHA.
		 * @return {jQuery.Deferred} On failure callback is passed an object with
		 * `type` and `details` properties. `type` is a string describing the type
		 * of error, `details` can be any object (usually error message).
		 */
		save: function ( options ) {
			var self = this,
				result = util.Deferred();

			options = options || {};

			/**
			 * Save content. Make an API request.
			 * @return {jQuery.Deferred}
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

				if ( util.isNumeric( self.sectionId ) ) {
					apiOptions.section = self.sectionId;
				}

				// eslint-disable-next-line no-restricted-properties
				self.api.postWithToken( 'edit', apiOptions ).then( function ( data ) {
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
				} ).fail( function ( code, data ) {
					switch ( code ) {
						case 'readonly':
							result.reject( {
								type: 'readonly',
								details: data.error
							} );
							break;
						case 'editconflict':
							result.reject( {
								type: 'editconflict',
								details: data.error
							}, null, data );
							break;
						default:
							result.reject( {
								type: 'error',
								details: 'http'
							} );
					}
				} );
				return result;
			}

			return saveContent();
		},

		/**
		 * Abort any pending previews.
		 * @memberof EditorGateway
		 * @instance
		 */
		abortPreview: function () {
			if ( this._pending ) {
				this._pending.abort();
			}
		},

		/**
		 * Get page preview from the API and abort any existing previews.
		 * @memberof EditorGateway
		 * @instance
		 * @param {Object} options API query parameters
		 * @return {jQuery.Deferred}
		 */
		getPreview: function ( options ) {
			var result = util.Deferred(),
				sectionLine = '',
				request,
				self = this;

			util.extend( options, {
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

			this.abortPreview();

			request = this.api.post( options );
			this._pending = request.then( function ( resp ) {
				if ( resp && resp.parse && resp.parse.text ) {
					// section 0 haven't a section name so skip
					if ( self.sectionId !== 0 &&
						resp.parse.sections !== undefined &&
						resp.parse.sections[0] !== undefined &&
						resp.parse.sections[0].line !== undefined
					) {
						sectionLine = resp.parse.sections[0].line;
					}
					result.resolve( {
						text: resp.parse.text['*'],
						line: sectionLine
					} );
				} else {
					result.reject();
				}
			}, function () {
				result.reject();
			} ).promise( {
				abort: function () { request.abort(); }
			} );

			return result;
		}
	};

	M.define( 'mobile.editor.api/EditorGateway', EditorGateway );

}( mw.mobileFrontend ) );
