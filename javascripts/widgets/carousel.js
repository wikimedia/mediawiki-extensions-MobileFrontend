( function( M, $ ) {

	var View = M.require( 'view' ), Carousel;

	// FIXME: the name Carousel is no longer accurate
	Carousel = View.extend( {
		template: M.template.get( 'specials/uploads/carousel' ),
		className: 'carousel tutorial slideable',
		postRender: function() {
			var self = this, $pages;
			$pages = this.$( '.slide' );
			this.page = 0;
			this.totalPages = $pages.length;
			this.$( 'ul li' ).on( 'click', function() {
				self.page = $( this ).index();
				self.showCurrentPage();
			} );
			this.showCurrentPage();
			this.$( 'button.prev' ).on( 'click', function() {
				self.previous();
			} );
			this.$( 'button.next' ).on( 'click', function() {
				self.next();
			} );
		},
		showCurrentPage: function() {
			this.$( '.slide' ).removeClass( 'active' ).removeClass( 'slider-left' ).removeClass( 'slider-right' );
			this.$( '.slide' ).eq( this.page - 1 ).addClass( 'slider-left' );
			this.$( '.slide' ).eq( this.page ).addClass( 'active' );
			this.$( '.slide' ).eq( this.page + 1 ).addClass( 'slider-right' );
			this.$( 'ul li' ).removeClass( 'active' ).
				eq( this.page ).addClass( 'active' );
			this.$( 'button' ).removeClass( 'active' );
			if ( this.page > 0 ) {
				this.$( 'button.prev' ).addClass( 'active' );
			}
			if ( this.page < this.totalPages - 1 ) {
				this.$( 'button.next' ).addClass( 'active' );
			}
		},
		next: function() {
			if ( this.page < this.totalPages - 1 ) {
				this.page += 1;
			}
			this.showCurrentPage();
		},
		previous: function() {
			if ( this.page > 0 ) {
				this.page -= 1;
			}
			this.showCurrentPage();
		}
	} );

	M.define( 'widgets/carousel', Carousel );

}( mw.mobileFrontend, jQuery ) );
