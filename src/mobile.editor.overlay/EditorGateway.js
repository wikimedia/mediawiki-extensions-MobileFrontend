const mobile = require( 'mobile.startup' );
const util = mobile.util;
const actionParams = mobile.actionParams;

/**
 * API that helps save and retrieve page content
 *
 * @private
 */
class EditorGateway {
	/**
	 * @param {Object} options Configuration options
	 * @param {mw.Api} options.api an Api to use.
	 * @param {string} options.title the title to edit
	 * @param {string|null} options.sectionId the id of the section to operate edits on.
	 * @param {number} [options.oldId] revision to operate on. If absent defaults to latest.
	 * @param {boolean} [options.fromModified] whether the page was loaded in a modified state
	 * @param {string} [options.preload] the name of a page to preload into the editor
	 * @param {Array} [options.preloadparams] parameters to prefill into the preload content
	 * @param {string} [options.editintro] edit intro to add to notices
	 */
	constructor( options ) {
		this.api = options.api;
		this.title = options.title;
		this.sectionId = options.sectionId;
		this.oldId = options.oldId;
		this.preload = options.preload;
		this.preloadparams = options.preloadparams;
		this.editintro = options.editintro;
		this.content = undefined;
		this.fromModified = options.fromModified;
		this.hasChanged = options.fromModified;
	}

	/**
	 * Get the block (if there is one) from the result.
	 *
	 * @param {Object} pageObj Page object
	 * @return {Object|null}
	 */
	getBlockInfo( pageObj ) {
		let blockedError;

		if ( pageObj.actions &&
			pageObj.actions.edit &&
			Array.isArray( pageObj.actions.edit )
		) {
			pageObj.actions.edit.some( ( error ) => {
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
	}

	/**
	 * Get the content of a page.
	 *
	 * @instance
	 * @return {jQuery.Promise}
	 */
	getContent() {
		let options;

		const resolve = () => util.Deferred().resolve( {
			text: this.content || '',
			blockinfo: this.blockinfo,
			notices: this.notices
		} );

		if ( this.content !== undefined ) {
			return resolve();
		} else {
			options = actionParams( {
				prop: [ 'revisions', 'info' ],
				rvprop: [ 'content', 'timestamp' ],
				inprop: [ 'preloadcontent', 'editintro' ],
				inpreloadcustom: this.preload,
				inpreloadparams: this.preloadparams,
				ineditintrocustom: this.editintro,
				titles: this.title,
				// get block information for this user
				intestactions: 'edit',
				// …and test whether this edit will auto-create an account
				intestactionsautocreate: true,
				intestactionsdetail: 'full'
			} );
			// Load text of old revision if desired
			if ( this.oldId ) {
				options.rvstartid = this.oldId;
			}
			// See T52136 - passing rvsection will fail with non wikitext
			if ( this.sectionId ) {
				options.rvsection = this.sectionId;
			}
			return this.api.get( options ).then( ( resp ) => {
				if ( resp.error ) {
					return util.Deferred().reject( resp.error.code );
				}

				const pageObj = resp.query.pages[0];
				// page might not exist and caller might not have known.
				if ( pageObj.missing !== undefined ) {
					if ( pageObj.preloadcontent ) {
						this.content = pageObj.preloadcontent.content;
						this.hasChanged = !pageObj.preloadisdefault;
					} else {
						this.content = '';
					}
				} else {
					const revision = pageObj.revisions[0];
					this.content = revision.content;
					this.timestamp = revision.timestamp;
				}

				// save content a second time to be able to check for changes
				this.originalContent = this.content;
				this.blockinfo = this.getBlockInfo( pageObj );
				this.wouldautocreate = pageObj.wouldautocreate && pageObj.wouldautocreate.edit;
				this.notices = pageObj.editintro;

				return resolve();
			} );
		}
	}

	/**
	 * Mark content as modified and set changes to be submitted when #save
	 * is invoked.
	 *
	 * @instance
	 * @param {string} content New section content.
	 */
	setContent( content ) {
		if ( this.originalContent !== content || this.fromModified ) {
			this.hasChanged = true;
		} else {
			this.hasChanged = false;
		}
		this.content = content;
	}

	/**
	 * Save the new content of the section, previously set using #setContent.
	 *
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
	save( options ) {
		const result = util.Deferred();

		options = options || {};

		/**
		 * Save content. Make an API request.
		 *
		 * @return {jQuery.Deferred}
		 */
		const saveContent = () => {
			const apiOptions = {
				action: 'edit',
				errorformat: 'html',
				errorlang: mw.config.get( 'wgUserLanguage' ),
				errorsuselocal: 1,
				formatversion: 2,
				title: this.title,
				summary: options.summary,
				captchaid: options.captchaId,
				captchaword: options.captchaWord,
				basetimestamp: this.timestamp,
				starttimestamp: this.timestamp
			};

			if ( this.content !== undefined ) {
				apiOptions.text = this.content;
			}

			if ( this.sectionId ) {
				apiOptions.section = this.sectionId;
			}

			// TODO: When `wouldautocreate` is true, we should also set up:
			// - apiOptions.returntofragment to be the URL fragment to link to the section
			//   (but we don't know what it is; `sectionId` here is the number)
			// - apiOptions.returntoquery to be 'redirect=no' if we're saving a redirect
			//   (but we have can't figure that out, unless we parse the wikitext)

			this.api.postWithToken( 'csrf', apiOptions ).then( ( data ) => {
				if ( data && data.edit && data.edit.result === 'Success' ) {
					this.hasChanged = false;
					result.resolve( data.edit.newrevid, data.edit.tempusercreatedredirect,
						data.edit.tempusercreated );
				} else {
					result.reject( data );
				}
			}, ( code, data ) => {
				result.reject( data );
			} );
			return result;
		};

		return saveContent();
	}

	/**
	 * Abort any pending previews.
	 *
	 * @instance
	 */
	abortPreview() {
		if ( this._pending ) {
			this._pending.abort();
		}
	}

	/**
	 * Get page preview from the API and abort any existing previews.
	 *
	 * @instance
	 * @param {Object} options API query parameters
	 * @return {jQuery.Deferred}
	 */
	getPreview( options ) {
		let
			sectionLine = '',
			sectionId = '';

		util.extend( options, {
			action: 'parse',
			// Enable section preview mode to avoid errors (T51218)
			sectionpreview: true,
			// Hide section edit links
			disableeditsection: true,
			// needed for pre-save transform to work (T55692)
			pst: true,
			// Output mobile HTML (T56243)
			mobileformat: true,
			useskin: mw.config.get( 'skin' ),
			disabletoc: true,
			title: this.title,
			prop: [ 'text', 'sections' ]
		} );

		this.abortPreview();
		// Acquire a temporary user username before previewing, so that signatures and
		// user-related magic words display the temp user instead of IP user in the
		// preview. (T331397)
		const promise = mw.user.acquireTempUserName().then( () => {
			this._pending = this.api.post( options );
			return this._pending;
		} );

		return promise.then( ( resp ) => {
			if ( resp && resp.parse && resp.parse.text ) {
				// When editing section 0 or the whole page, there is no section name, so skip
				if ( this.sectionId && this.sectionId !== '0' &&
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
			abort: () => {
				this._pending.abort();
			}
		} );
	}
}

module.exports = EditorGateway;
