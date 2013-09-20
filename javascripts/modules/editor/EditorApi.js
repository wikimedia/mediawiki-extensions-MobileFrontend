( function( M, $ ) {

	var Api = M.require( 'api' ).Api, EditorApi = Api.extend( {

		initialize: function( options ) {
			this._super( options );
			this.title = options.title;
			this.sectionId = options.sectionId;
			// return an empty section for new pages
			this.content = options.isNew ? '' : null;
			this.hasChanged = false;
		},

		getContent: function() {
			var self = this, result = $.Deferred(), options;

			if ( this.content !== null ) {
				result.resolve( this.content );
			} else {
				options = {
					action: 'query',
					prop: 'revisions',
					rvprop: [ 'content', 'timestamp' ],
					titles: this.title
				};
				// See Bug 50136 - passing rvsection will fail with non wikitext
				if ( $.isNumeric( this.sectionId ) ) {
					options.rvsection = this.sectionId;
				}
				this.get( options ).done( function( resp ) {
					var revision;

					if ( resp.error ) {
						result.reject( resp.error.code );
						return;
					}

					// FIXME: MediaWiki API, seriously?
					revision = $.map( resp.query.pages, function( page ) {
						return page;
					} )[0].revisions[0];

					self.content = revision['*'];
					self.timestamp = revision.timestamp;

					result.resolve( self.content );
				} );
			}

			return result;
		},

		/**
		 * Mark content as modified and set changes to be submitted when #save
		 * is invoked.
		 *
		 * @param content String New section content.
		 */
		setContent: function( content ) {
			this.content = content;
			this.hasChanged = true;
		},

		/**
		 * Save the new content of the section, previously set using #setContent.
		 *
		 * @param [options.summary] String Optional summary for the edit.
		 * @param [options.captchaId] String If CAPTCHA was requested, ID of the
		 * captcha.
		 * @param [options.captchaWord] String If CAPTCHA was requested, term
		 * displayed in the CAPTCHA.
		 * @return jQuery.Deferred On failure callback is passed an object with
		 * `type` and `details` properties. `type` is a string describing the type
		 * of error, `details` can be any object (usually error message).
		 */
		save: function( options ) {
			var self = this, result = $.Deferred();
			options = options || {};

			if ( !this.hasChanged ) {
				throw new Error( 'No changes to save' );
			}

			function saveContent( token ) {
				var apiOptions = {
					action: 'edit',
					title: self.title,
					text: self.content,
					summary: options.summary,
					captchaid: options.captchaId,
					captchaword: options.captchaWord,
					token: token,
					basetimestamp: self.timestamp,
					starttimestamp: self.timestamp
				};

				if ( $.isNumeric( self.sectionId ) ) {
					apiOptions.section = self.sectionId;
				}

				self.post( apiOptions ).done( function( data ) {
					if ( data && data.edit && data.edit.result === 'Success' ) {
						self.hasChanged = false;
						result.resolve();
					} else if ( data && data.error ) {
						// Edit API error
						result.reject( { type: 'error', details: data.error.code } );
					} else if ( data && data.edit && data.edit.captcha ) {
						// CAPTCHAs
						result.reject( { type: 'captcha', details: data.edit.captcha } );
					} else if ( data && data.edit && data.edit.code ) {
						// extension errors (mostly abusefilter)
						// FIXME: we need to support this, see bug 52049
						result.reject( { type: 'error', details: data.edit.code } );
					} else {
						result.reject( { type: 'error', details: 'unknown' } );
					}
				} ).fail( $.proxy( result, 'reject', { type: 'error', details: 'HTTP error' } ) );
			}

			this.getToken().done( saveContent ).fail( $.proxy( result, 'reject' ) );

			return result;
		}
	} );

	M.define( 'modules/editor/EditorApi', EditorApi );

}( mw.mobileFrontend, jQuery ) );
