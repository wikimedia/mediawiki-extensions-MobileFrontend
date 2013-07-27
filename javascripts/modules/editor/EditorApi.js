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

		save: function( summary ) {
			var self = this, result = $.Deferred();

			if ( !this.hasChanged ) {
				throw new Error( 'No changes to save' );
			}

			function saveContent( token ) {
				var options = {
					action: 'edit',
					title: self.title,
					text: self.content,
					summary: summary,
					token: token,
					basetimestamp: self.timestamp,
					starttimestamp: self.timestamp
				};

				if ( $.isNumeric( self.sectionId ) ) {
					options.section = self.sectionId;
				}

				self.post( options ).done( function( data ) {
					if ( data && data.edit && data.edit.result === 'Success' ) {
						self.hasChanged = false;
						result.resolve();
					} else if ( data && data.error ) {
						// Edit API error
						result.reject( data.error.code );
					} else if ( data && data.edit && data.edit.captcha ) {
						// CAPTCHAs
						// FIXME: we need to support this, see bug 52047
						result.reject( 'unsupported-captcha' );
					} else if ( data && data.edit && data.edit.code ) {
						// extension errors (mostly abusefilter)
						// FIXME: we need to support this, see bug 52049
						result.reject( data.edit.code );
					} else {
						result.reject( 'unknown' );
					}
				} ).fail( $.proxy( result, 'reject', 'HTTP error' ) );
			}

			this.getToken().done( saveContent ).fail( $.proxy( result, 'reject' ) );

			return result;
		}
	} );

	M.define( 'modules/editor/EditorApi', EditorApi );

}( mw.mobileFrontend, jQuery ) );
