( function( M ) {
	var Drawer = M.require( 'Drawer' ), Toast;

	/**
	 * @class
	 * @extends Drawer
	 */
	Toast = Drawer.extend( {
		className: 'toast position-fixed',
		minHideDelay: 1000,
		/**
		 * @method
		 * @param {String} content
		 * @param {String} className
		 */
		show: function( content, className ) {
			this.$el.
				html( content ).
				removeAttr( 'class' ).
				addClass( this.className ).
				addClass( className );
			Drawer.prototype.show.apply( this, arguments );
		}
	} );

	M.define( 'toast', new Toast() );

}( mw.mobileFrontend ) );
