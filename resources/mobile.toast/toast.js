( function ( M ) {
	var Toast,
		Drawer = M.require( 'Drawer' );

	/**
	 * Auto-expiring notification.
	 * @class
	 * @extends Drawer
	 */
	Toast = Drawer.extend( {
		className: 'toast position-fixed',
		minHideDelay: 1000,
		/**
		 * Show the toast message with a given class and content
		 * @method
		 * @param {String} content Content to be placed in element
		 * @param {String} className class to add to element
		 */
		show: function ( content, className ) {
			this.$el
				.html( content )
				.removeAttr( 'class' )
				.addClass( this.className )
				.addClass( className );
			Drawer.prototype.show.apply( this, arguments );
		}
	} );

	M.define( 'toast', new Toast() );

}( mw.mobileFrontend ) );
