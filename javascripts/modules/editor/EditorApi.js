( function( M, $ ) {

	var Api = M.require( 'api' ).Api, EditorApi = Api.extend( {

		initialize: function( options ) {
			this._super( options );
			this.title = options.title;
			this._sectionCache = {};
			this._sectionStage = {};

			// return an empty section for new pages
			if ( options.isNew ) {
				this._sectionCache[0] = { id: 0, content: '' };
			}
		},

		getSection: function( id ) {
			var self = this, result = $.Deferred();

			if ( this._sectionCache[id] ) {
				result.resolve( this._sectionCache[id] );
			} else {
				self.get( {
					action: 'query',
					prop: 'revisions',
					rvprop: [ 'content', 'timestamp' ],
					titles: self.title,
					rvsection: id
				} ).done( function( resp ) {
					var revision;

					if ( resp.error ) {
						result.reject( resp.error.code );
						return;
					}

					// FIXME: MediaWiki API, seriously?
					revision = $.map( resp.query.pages, function( page ) {
						return page;
					} )[0].revisions[0];

					self._sectionCache[id] = {
						id: id,
						timestamp: revision.timestamp,
						content: revision['*']
					};
					result.resolve( self._sectionCache[id] );
				} );
			}

			return result;
		},

		/**
		 * Mark section as modified and queue changes to be submitted when #save
		 * is invoked.
		 *
		 * @param id Number Section id.
		 * @param content String New section content.
		 */
		stageSection: function( id, content ) {
			this._sectionCache[id].content = content;
			this._sectionStage[id] = this._sectionCache[id];
		},

		getStagedCount: function() {
			return $.map( this._sectionStage, function( section ) {
					return section;
			} ).length;
		},

		save: function( summary ) {
			var self = this, result = $.Deferred(),
				sections = $.map( this._sectionStage, function( section ) {
					return section;
				} );

			if ( !sections.length ) {
				throw new Error( 'No staged sections' );
			}

			function saveSection( token ) {
				var section = sections.pop();

				self.post( {
					action: 'edit',
					title: self.title,
					section: section.id,
					text: section.content,
					summary: summary,
					token: token,
					basetimestamp: section.timestamp,
					starttimestamp: section.timestamp
				} ).done( function( data ) {
					if ( data && data.error ) {
						result.reject( data.error.code );
					} else if ( !sections.length ) {
						self._sectionStage = {};
						result.resolve();
					} else {
						saveSection( token );
					}
				} ).fail( $.proxy( result, 'reject', 'HTTP error' ) );
			}

			this.getToken().done( saveSection ).fail( $.proxy( result, 'reject' ) );

			return result;
		}
	} );

	M.define( 'modules/editor/EditorApi', EditorApi );

}( mw.mobileFrontend, jQuery ) );
