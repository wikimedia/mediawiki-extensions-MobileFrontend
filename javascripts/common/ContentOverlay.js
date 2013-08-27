( function( M, $ ) {

	var Overlay = M.require( 'Overlay' ), ContentOverlay;

	ContentOverlay = Overlay.extend( {
		fullScreen: false,
		appendTo: '#mw-mf-page-center',
		postRender: function( options ) {
			this._super( options );
			if ( options.target ) {
				this.addPointerArrow( $( options.target ) );
			}
		},
		addPointerArrow: function( $pa ) {
			var tb = 'solid 10px transparent',
				paOffset = $pa.offset(),
				h = $pa.outerHeight( true );

			this.$el.css( 'top', paOffset.top + h );
			$( '<div>' ).css( {
				'border-bottom': 'solid 10px #006398',
				'border-right': tb,
				'border-left': tb,
				position: 'absolute',
				top: -10,
				left: paOffset.left + 10
			} ).appendTo( this.$el );
		}
	} );
	M.define( 'ContentOverlay', ContentOverlay );

}( mw.mobileFrontend, jQuery ) );
