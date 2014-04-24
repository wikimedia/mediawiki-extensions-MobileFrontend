( function( M ) {
	var Drawer = M.require( 'Drawer' ), Toast;

	/**
	 * @class
	 * @extends Drawer
	 */
	Toast = Drawer.extend( {
		className: 'toast position-fixed border-box',
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
			this._super();
		}
	} );

	M.define( 'toast', new Toast() );

}( mw.mobileFrontend ) );
