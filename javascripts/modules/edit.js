( function( M, $ ) {

	var Overlay = M.require( 'navigation' ).Overlay,
		Api = M.require( 'api' ).Api,
		EditApi, EditOverlay;

	EditApi = Api.extend( {
		initialize: function( options ) {
			this._super( options );
			this.pageId = options.pageId;
			this._sectionCache = {};
			this._sectionStage = {};
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
					pageids: self.pageId,
					rvsection: id
				} ).done( function( resp ) {
					self._sectionCache[id] = {
						section: id,
						// FIXME: MediaWiki API, seriously?
						timestamp: resp.query.pages[ self.pageId ].revisions[0].timestamp,
						content: resp.query.pages[ self.pageId ].revisions[0]['*']
					};
					result.resolve( self._sectionCache[id] );
				} );
				// TODO: possible failures?
			}

			return result;
		},

		stageSection: function( id, content ) {
			this._sectionStage[id] = {
				id: id,
				content: content
			};
		},

		save: function() {
			var self = this, result = $.Deferred(),
				sections = $.map( this._sectionStage, function( section ) {
					return section;
				} );

			function saveSection( token ) {
				var section = sections.pop(), timestamp = self._sectionCache[section.id].timestamp;

				self.post( {
					action: 'edit',
					pageid: self.pageId,
					section: section.id,
					text: section.content,
					token: token,
					basetimestamp: timestamp,
					starttimestamp: timestamp
				} ).done( function( data ) {
					if ( data && data.error ) {
						result.reject( data.error.code );
					} else if ( !sections.length ) {
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

	EditOverlay = Overlay.extend( {
		template: M.template.get( 'overlays/edit/edit' ),
		className: 'mw-mf-overlay edit-overlay',

		initialize: function( options ) {
			var self = this;
			this._super( options );

			this.api = new EditApi( { pageId: options.pageId } );
			this.sectionCount = options.sectionCount;
			this.$loading = this.$( '.loading' );
			this.$content = this.$( 'textarea' ).
				// can't use $.proxy because self.section and self.$content change
				on( 'change', function() {
					self.api.stageSection( self.section, self.$content.val() );
				} );
			this.$prev = this.$( '.prev-section' ).
				on( 'click', function() {
					self._loadSection( self.section - 1 );
				} );
			this.$next = this.$( '.next-section' ).
				on( 'click', function() {
					self._loadSection( self.section + 1 );
				} );
			this.$( '.save' ).on( 'click', $.proxy( self.api, 'save' ) );

			this._loadSection( options.section );
		},

		_loadSection: function( section ) {
			var self = this;

			this.$content.hide();
			this.$loading.show();

			this.$prev.prop( 'disabled', section === 0 );
			this.$next.prop( 'disabled', section === this.sectionCount - 1 );
			this.section = section;

			this.api.getSection( section ).done( function( data ) {
				// prevent delayed response overriding content on multiple prev/next clicks
				if ( data.section === section ) {
					self.$content.show().val( data.content );
					self.$loading.hide();
				}
			} );
		}
	} );

	( function() {
		if (
			( mw.config.get( 'wgMFAnonymousEditing' ) || mw.config.get( 'wgUserName' ) ) &&
			mw.config.get( 'wgIsPageEditable' )
		) {
			$( '<button id="edit-page" class="inline">' ).
				text( mw.msg( 'edit' ) ).
				prependTo( '#content' ).
				on( 'click', function() {
					new EditOverlay( {
						pageId: mw.config.get( 'wgArticleId' ),
						section: 0,
						// FIXME: possibly we should have a global Page instance with
						// a method for fetching this
						sectionCount: $( '.section' ).length + 1
					} ).show();
				} );
		}
	}() );

	M.define( 'modules/edit', {
		// just for testing
		_EditApi: EditApi,
		_EditOverlay: EditOverlay
	} );

}( mw.mobileFrontend, jQuery ) );
