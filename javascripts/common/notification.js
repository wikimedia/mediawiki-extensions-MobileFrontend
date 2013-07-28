( function( M ) {
	var Drawer = M.require( 'Drawer' ), Toast;

	Toast = Drawer.extend( {
		className: 'toast position-fixed',
		minHideDelay: 1000,

		show: function( content, className ) {
			this.$el.
				html( content ).
				removeAttr( 'class' ).
				addClass( this.className ).
				addClass( className );
			this._super();
		}
	} );

	M.define( 'notifications', new Toast() );

}( mw.mobileFrontend ) );
