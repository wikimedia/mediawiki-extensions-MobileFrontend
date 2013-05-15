( function( M, $ ) {

	var Overlay = M.require( 'navigation' ).Overlay,
		Api = M.require( 'api' ).Api,
		EditApi, EditOverlay;

	EditApi = Api.extend( {
		initialize: function( options ) {
			this._super( options );
			this.pageId = options.pageId;
		},

		getSection: function( id ) {
			var self = this, result = $.Deferred();

			self.get( {
				action: 'query',
				prop: 'revisions',
				rvprop: [ 'content', 'timestamp' ],
				pageids: self.pageId,
				rvsection: id
			} ).done( function( resp ) {
				// FIXME: MediaWiki API, seriously?
				result.resolve( resp.query.pages[ self.pageId ].revisions[0]['*'] );
				console.log( resp ); //XXX
			} );

			return result;
		},

		setSection: function( id, data ) {
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
			this.$content = this.$( 'textarea' );

			this.$( '.prev-section' ).on( 'click', function() {
				self._loadSection( self.section - 1 );
			} );
			this.$( '.next-section' ).on( 'click', function() {
				self._loadSection( self.section + 1 );
			} );

			this._loadSection( options.section );
		},

		_loadSection: function( section ) {
			var self = this;

			self.section = section;
			// TODO: disable/enable Prev/Next
			// TODO: show loader

			self.api.getSection( section ).done( function( content ) {
				self.$content.val( content );
				// TODO: hide loader
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
						section: 0
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
