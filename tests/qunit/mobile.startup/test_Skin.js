( function ( M, $ ) {
	var Skin = M.require( 'Skin' );

	QUnit.module( 'MobileFrontend Skin.js', {
		setup: function () {
			this.$el = $( '<div>' );
			this.skin = new Skin( {
				el: this.$el,
				page: M.getCurrentPage()
			} );
		}
	} );

	QUnit.test( '#setupPositionFixedEmulation', 1, function ( assert ) {
		this.skin.setupPositionFixedEmulation();
		assert.strictEqual( this.$el.hasClass( 'no-position-fixed' ), true,
			'Skin is marked as working in emulated mode.' );
	} );

}( mw.mobileFrontend, jQuery ) );
