var util = require( '../mobile.startup/util' ),
	actionParams = require( '../mobile.startup/actionParams' );

/**
 * API that helps save and retrieve page content
 *
 * @class EditorGateway
 *
 * @param {Object} options Configuration options
 * @param {mw.Api} options.api an Api to use.
 * @param {string} options.title the title to edit
 * @param {string|null} options.sectionId the id of the section to operate edits on.
 * @param {number} [options.oldId] revision to operate on. If absent defaults to latest.
 * @param {boolean} [options.isNewPage] whether the page being created is new
 * @param {boolean} [options.fromModified] whether the page was loaded in a modified state
 */
function EditorGateway( options ) {
	this.api = options.api;
	this.title = options.title;
	this.sectionId = options.sectionId;
	this.oldId = options.oldId;
	// return an empty section for new pages
	this.content = options.isNewPage ? '' : undefined;
	this.fromModified = options.fromModified;
	this.hasChanged = options.fromModified;
}

EditorGateway.prototype = {

	/**
	 * Get the block (if there is one) from the result.
	 *
	 * @memberof EditorGateway
	 * @param {Object} pageObj Page object
	 * @return {Object|null}
	 */
	getBlockInfo: function ( pageObj ) {
		var blockedError;

		if ( pageObj.actions &&
			pageObj.actions.edit &&
			Array.isArray( pageObj.actions.edit )
		) {
			pageObj.actions.edit.some( function ( error ) {
				if ( [ 'blocked', 'autoblocked' ].indexOf( error.code ) !== -1 ) {
					blockedError = error;
					return true;
				}
				return false;
			} );

			if ( blockedError && blockedError.data && blockedError.data.blockinfo ) {
				return blockedError.data.blockinfo;
			}
		}

		return null;
	},
	/**
	 * Get the content of a page.
	 *
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
				blockinfo: self.blockinfo
			} );
		}

		if ( this.content !== undefined ) {
			return resolve();
		} else {
			options = actionParams( {
				prop: [ 'revisions', 'info' ],
				rvprop: [ 'content', 'timestamp' ],
				titles: self.title,
				// get block information for this user
				intestactions: 'edit',
				intestactionsdetail: 'full'
			} );
			// Load text of old revision if desired
			if ( this.oldId ) {
				options.rvstartid = this.oldId;
			}
			// See Bug 50136 - passing rvsection will fail with non wikitext
			if ( this.sectionId ) {
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
				self.blockinfo = self.getBlockInfo( pageObj );

				return resolve();
			} );
		}
	},

	/**
	 * Mark content as modified and set changes to be submitted when #save
	 * is invoked.
	 *
	 * @memberof EditorGateway
	 * @instance
	 * @param {string} content New section content.
	 */
	setContent: function ( content ) {
		if ( this.originalContent !== content || this.fromModified ) {
			this.hasChanged = true;
		} else {
			this.hasChanged = false;
		}
		this.content = content;
	},

	/**
	 * Mark content as modified and set text that should be prepended to given
	 * section when #save is invoked.
	 *
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
	 *
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
		 *
		 * @return {jQuery.Deferred}
		 */
		function saveContent() {
			var apiOptions = {
				action: 'edit',
				errorformat: 'html',
				errorlang: mw.config.get( 'wgUserLanguage' ),
				errorsuselocal: 1,
				formatversion: 2,
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

			if ( self.sectionId ) {
				apiOptions.section = self.sectionId;
			}

			self.api.postWithToken( 'csrf', apiOptions ).then( function ( data ) {
				if ( data && data.edit && data.edit.result === 'Success' ) {
					self.hasChanged = false;
					result.resolve( data.edit.newrevid );
				} else {
					result.reject( data );
				}
			}, function ( code, data ) {
				result.reject( data );
			} );
			return result;
		}

		return saveContent();
	},

	/**
	 * Abort any pending previews.
	 *
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
	 *
	 * @memberof EditorGateway
	 * @instance
	 * @param {Object} options API query parameters
	 * @return {jQuery.Deferred}
	 */
	getPreview: function ( options ) {
		var
			sectionLine = '',
			sectionId = '',
			self = this;

		util.extend( options, {
			action: 'parse',
			// Enable section preview mode to avoid errors (bug 49218)
			sectionpreview: true,
			// Hide section edit links
			disableeditsection: true,
			// needed for pre-save transform to work (bug 53692)
			pst: true,
			// Output mobile HTML (bug 54243)
			mobileformat: true,
			title: this.title,
			prop: [ 'text', 'sections' ]
		} );

		this.abortPreview();
		this._pending = this.api.post( options );

		return this._pending.then( function ( resp ) {
			if ( resp && resp.parse && resp.parse.text ) {
				// section 0 haven't a section name so skip
				if ( self.sectionId !== '0' &&
					resp.parse.sections !== undefined &&
					resp.parse.sections[0] !== undefined
				) {
					if ( resp.parse.sections[0].anchor !== undefined ) {
						sectionId = resp.parse.sections[0].anchor;
					}
					if ( resp.parse.sections[0].line !== undefined ) {
						sectionLine = resp.parse.sections[0].line;
					}
				}
				return {
					text: resp.parse.text['*'],
					id: sectionId,
					line: sectionLine
				};
			} else {
				return util.Deferred().reject();
			}
		} ).promise( {
			abort: function () { self._pending.abort(); }
		} );
	}
};

module.exports = EditorGateway;
