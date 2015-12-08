( function ( M ) {
	var ToastDrawer,
		Drawer = M.require( 'mobile.drawers/Drawer' );

	/**
	 * Auto-expiring notification.
	 * @class
	 * @extends Drawer
	 */
	ToastDrawer = Drawer.extend( {
		className: 'toast position-fixed view-border-box',
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

	M.define( 'mobile.toast/ToastDrawer', ToastDrawer );

}( mw.mobileFrontend ) );
