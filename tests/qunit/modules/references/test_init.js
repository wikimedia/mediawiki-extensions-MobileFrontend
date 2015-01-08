( function ( $, M ) {

	var R = mw.mobileFrontend.require( 'references' ),
		context = M.require( 'context' ),
		ReferencesDrawer = M.require( 'modules/references/ReferencesDrawer' );

	QUnit.module( 'MobileFrontend references.js', {
		setup: function () {
			$( '<div id="mfe-test-references"><sup><a href="#ref-foo">[1]</a></sup></div><ol class="references"><li id="ref-foo"><a>test reference</a></li></ol>' ).appendTo( '#qunit-fixture' );
			// prevent events from being logged.
			this.sandbox.stub( ReferencesDrawer.prototype, 'show' );
			this.sandbox.stub( context, 'isBetaGroupMember' ).returns( false );
		},
		teardown: function () {
			$( '#mfe-test-references' ).remove();
		}
	} );

	QUnit.test( 'Standard', 2, function ( assert ) {
		R.setup( {
			$el: $( '#mfe-test-references' )
		} );
		$( '#mfe-test-references sup a' ).trigger( 'click' );
		assert.strictEqual( $( '.drawer.references h3' ).text(), '[1]' );
		assert.strictEqual( $( '.drawer.references a' ).text(), 'test reference' );
	} );

} )( jQuery, mw.mobileFrontend );
