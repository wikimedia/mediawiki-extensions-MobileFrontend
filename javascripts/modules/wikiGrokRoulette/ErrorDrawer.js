( function ( M ) {
	var Drawer = M.require( 'Drawer' ),
		ErrorDrawer;

	/**
	 * Drawer that shows a generic error message.
	 * @class
	 * @extends Drawer
	 */
	ErrorDrawer = Drawer.extend( {
		template: mw.template.get( 'mobile.wikigrok.roulette', 'Error.hogan' ),
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			var self = this;
			Drawer.prototype.postRender.apply( this, arguments );
			this.$el.find( '.close' ).on( 'click', function () {
				self.detach();
			} );
			self.show();
		}
	} );

	M.define( 'modules/wikiGrokRoulette/ErrorDrawer', ErrorDrawer );

}( mw.mobileFrontend ) );
