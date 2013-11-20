( function( M, $ ) {

	var
		OverlayNew = M.require( 'OverlayNew' ),
		SearchApi = M.require( 'modules/searchNew/SearchApi' ),
		KEY_ENTER = 13,
		SEARCH_DELAY = 500,
		SearchOverlay;

	SearchOverlay = OverlayNew.extend( {
		className: 'overlay search-overlay',
		template: M.template.get( 'modules/searchNew/SearchOverlay' ),
		defaults: {
			placeholderMsg: $( '#searchInput' ).attr( 'placeholder' ),
			clearMsg: mw.msg( 'mobile-frontend-clear-search' ),
			searchContentMsg: mw.msg( 'mobile-frontend-search-content' ),
			noResultsMsg: mw.msg( 'mobile-frontend-search-no-results' ),
			searchContentNoResultsMsg: mw.msg( 'mobile-frontend-search-content-no-results' ),
			action: mw.config.get( 'wgScript' )
		},
		closeOnBack: true,

		initialize: function( options ) {
			this._super( options );
			this.api = new SearchApi();
		},

		postRender: function( options ) {
			var
				self = this,
				$clear = this.$( '.clear' ),
				$form = this.$( 'form' );

			this._super( options );

			this.$input = this.$( 'input' ).on( 'input', function( ev ) {
				if ( ev.which === KEY_ENTER ) {
					$form.submit();
				} else {
					self.performSearch();
				}

				$clear.toggle( self.$input.val() !== '' );
			} );

			$clear.hide().on( M.tapEvent( 'click' ), function() {
				self.$input.val( '' ).focus();
				self.performSearch();
				$clear.hide();
			} );

			this.$searchContent = this.$( '.search-content' ).
				hide().
				// can't use $.proxy because it would pass ev to submit() which would
				// be treated as alternative form data
				on( M.tapEvent( 'click' ), function() {
					$form.submit();
				} );

			// tapping on background only should hide the overlay
			this.$el.on( M.tapEvent( 'click' ), function() {
				window.history.back();
			} );
			this.$( '> div' ).on( M.tapEvent( 'click' ), function( ev ) {
				ev.stopPropagation();
			} );
		},

		show: function() {
			this._super();
			this.$input.focus();
		},

		performSearch: function() {
			var
				self = this,
				query = this.$input.val(),
				$results = this.$( '.results' );

			this.api.abort();
			clearTimeout( this.timer );
			self.$searchContent.hide();
			$results.empty();

			if ( query.length ) {
				$results.addClass( 'loading' );

				this.timer = setTimeout( function() {
					self.api.search( query ).done( function( data ) {
						// check if we're getting the rights response in case of out of
						// order responses (need to get the current value of the input)
						if ( data.query === self.$input.val() ) {
							self.$searchContent.
								show().
								find( 'p' ).
								hide().
								filter( data.results.length ? '.with-results' : '.without-results' ).
								show();
							$results.
								removeClass( 'loading' ).
								html( M.template.get( 'articleList' ).render( { pages: data.results } ) );
							M.emit( 'search-results', self, data.results );
						}
					} );
				}, SEARCH_DELAY );
			} else {
				$results.removeClass( 'loading' );
			}
		}
	} );

	M.define( 'modules/searchNew/SearchOverlay', SearchOverlay );

}( mw.mobileFrontend, jQuery ));
