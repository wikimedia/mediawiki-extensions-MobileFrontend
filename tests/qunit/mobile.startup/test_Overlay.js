( function ( M, $ ) {
	var Overlay = M.require( 'mobile.startup/Overlay' );

	QUnit.module( 'MobileFrontend: Overlay.js', {
		beforeEach: function () {
			this.clock = this.sandbox.useFakeTimers();
			// Create a dummy mw-mf-viewport if none exists
			if ( !$( '#mw-mf-viewport' ).length ) {
				this.$viewport = $( '<div>' ).attr( 'id', 'mw-mf-viewport' ).appendTo( 'body' );
			}
		},
		afterEach: function () {
			if ( this.$viewport ) {
				this.$viewport.remove();
			}
		}
	} );

	QUnit.test( 'Simple overlay', function ( assert ) {
		var overlay = new Overlay( {
			heading: '<h2>Title</h2>',
			content: 'Text',
			appendToElement: 'div'
		} );
		overlay.show();
		assert.ok( overlay.$el[ 0 ].parentNode, 'In DOM' );
		overlay.hide();
	} );

	QUnit.test( 'HTML overlay', function ( assert ) {
		var overlay;

		function TestOverlay() {
			Overlay.apply( this, arguments );
		}

		OO.mfExtend( TestOverlay, Overlay, {
			templatePartials: $.extend( Overlay.prototype.templatePartials, {
				content: mw.template.compile( '<div class="content">YO</div>', 'hogan' )
			} )
		} );
		overlay = new TestOverlay( {
			heading: 'Awesome'
		} );
		assert.strictEqual( overlay.$el.find( 'h2' ).html(), 'Awesome' );
		assert.strictEqual( overlay.$el.find( '.content' ).text(), 'YO' );
	} );

	QUnit.test( 'Close overlay', function ( assert ) {
		var overlay = new Overlay( {
			heading: '<h2>Title</h2>',
			content: 'Text'
		} );
		overlay.show();
		overlay.hide();
		this.clock.tick( 1000 );
		assert.strictEqual( overlay.$el[ 0 ].parentNode, null, 'No longer in DOM' );
	} );
}( mw.mobileFrontend, jQuery ) );
