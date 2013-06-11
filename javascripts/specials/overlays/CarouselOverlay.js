( function( M ) {
	var Overlay = M.require( 'Overlay' ),
		Carousel = M.require( 'widgets/carousel' ),
		CarouselOverlay = Overlay.extend( {
			template: '',
			className: 'overlay-carousel mw-mf-overlay',
			initialize: function( options ) {
				this._super( options );
				this.carousel = new Carousel( { pages: options.pages } );
			},
			postRender: function( options ) {
				this.$el.empty();
				this.carousel.appendTo( this.$el );
				this._super( options );
			}
		} );

M.define( 'overlays/CarouselOverlay', CarouselOverlay );

}( mw.mobileFrontend ) );