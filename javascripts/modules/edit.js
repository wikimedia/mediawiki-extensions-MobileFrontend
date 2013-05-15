( function( M, $ ) {

	var Overlay = M.require( 'navigation' ).Overlay,
		Api = M.require( 'api' ).Api,
		EditApi, EditOverlay;

	EditApi = Api.extend( {
		initialize: function( options ) {
			this._super( options );
			this.pageId = options.pageId;
		},

		getSection: function( section ) {
			var self = this, result = $.Deferred();

			self.get( {
				action: 'query',
				prop: 'revisions',
				rvprop: [ 'content', 'timestamp' ],
				pageids: self.pageId,
				rvsection: section
			} ).done( function( resp ) {
				result.resolve( {
					section: section,
					// FIXME: MediaWiki API, seriously?
					content: resp.query.pages[ self.pageId ].revisions[0]['*']
				} );
				console.log( resp ); //XXX
			} );

			return result;
		},

		setSection: function( section, data ) {
			console.log(data);
		},

		save: function() {
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
			this.$content = this.$( 'textarea' );
			this.$prev = this.$( '.prev-section' );
			this.$next = this.$( '.next-section' );

			this._loadSection( options.section );
			this.$prev.on( 'click', function() {
				self._loadSection( self.section - 1 );
			} );
			this.$next.on( 'click', function() {
				self._loadSection( self.section + 1 );
			} );
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
