( function ( M, $ ) {
	var Page = M.require( 'mobile.startup/Page' ),
		Skin = M.require( 'mobile.startup/Skin' );

	QUnit.module( 'MobileFrontend Skin.js', {
		setup: function () {
			// Skin will request tablet modules - avoid this
			this.sandbox.stub( mw.loader, 'using' ).returns( $.Deferred().resolve() );
			this.$el = $( '<div>' );
			this.skin = new Skin( {
				el: this.$el,
				page: new Page( {
					title: 'Foo'
				} )
			} );
		}
	} );

	QUnit.test( '#setupPositionFixedEmulation', 1, function ( assert ) {
		this.skin.setupPositionFixedEmulation();
		assert.strictEqual( this.$el.hasClass( 'no-position-fixed' ), true,
			'Skin is marked as working in emulated mode.' );
	} );

}( mw.mobileFrontend, jQuery ) );
