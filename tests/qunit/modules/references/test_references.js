( function( $, R ) {

QUnit.module( "MobileFrontend references.js", {
	setup: function() {
		$('<div id="mfe-test-references"><sup><a href="#ref-foo">[1]</a></sup></div><ol class="references"><li id="ref-foo"><a>test reference</a></li></ol>').appendTo('#qunit-fixture');
	},
	teardown: function() {
		$( '#mfe-test-references' ).remove();
	}
});

QUnit.test( 'Standard', 2, function( assert ) {
	R.setup( $( '#mfe-test-references' ) );
	$("#mfe-test-references sup a").trigger("click");
	assert.strictEqual( $( '#notifications .references h3' ).text(), '[1]' );
	assert.strictEqual( $( '#notifications .references a' ).text(), 'test reference' );
});

} )( jQuery, mw.mobileFrontend.require( 'references' ) );
