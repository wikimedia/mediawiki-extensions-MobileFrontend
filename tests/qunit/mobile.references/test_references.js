( function ( $, M ) {

	var R = mw.mobileFrontend.require( 'mobile.references/references' ),
		ReferencesDrawer = M.require( 'mobile.references/ReferencesDrawer' );

	QUnit.module( 'MobileFrontend references.js', {
		setup: function () {
			$( '<div id="mfe-test-references">' +
				'<sup id="cite_ref-1" class="reference"><a href="#cite_note-1">[1]</a></sup>' +
				'<ol class="references">' +
					'<li id="cite_note-1">' +
						'<span class="mw-cite-backlink"><a href="#cite_ref-1">↑</a></span> <span class="reference-text">hello</span>' +
					'</li>' +
				'</ol>'
			).appendTo( '#qunit-fixture' );
			// prevent events from being logged.
			this.sandbox.stub( ReferencesDrawer.prototype, 'show' );
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
		assert.strictEqual( $( '.drawer.references sup' ).text(), '[1]' );
		assert.strictEqual( $( '.drawer.references .reference-text' ).text(), 'hello' );
	} );

} )( jQuery, mw.mobileFrontend );
