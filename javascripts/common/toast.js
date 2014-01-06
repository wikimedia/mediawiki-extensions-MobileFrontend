( function( M ) {
	var Drawer = M.require( 'Drawer' ), Toast;

	/**
	 * @class
	 * @name Toast
	 * @extends Drawer
	 */
	Toast = Drawer.extend( {
		className: 'toast position-fixed',
		minHideDelay: 1000,
		/**
		 * @name Toast.prototype.show
		 * @function
		 * @param {String} content
		 * @param {String} className
		 */
		show: function( content, className ) {
			this.$el.
				html( content ).
				removeAttr( 'class' ).
				addClass( this.className ).
				addClass( className );
			this._super();
		}
	} );

	M.define( 'toast', new Toast() );

}( mw.mobileFrontend ) );
