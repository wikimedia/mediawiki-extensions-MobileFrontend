( function( $, R ) {

module("MobileFrontend references.js", {
	setup: function() {
		$('<div id="mfe-test-references"><sup><a href="#ref-foo">[1]</a></sup></div><ol class="references"><li id="ref-foo"><a>test reference</a></li></ol>').appendTo('#qunit-fixture');
	},
	teardown: function() {
		$( '#mfe-test-references' ).remove();
	}
});

test("Standard", function() {
	R.setupReferences( $( '#mfe-test-references' )[ 0 ] );
	$("#mfe-test-references sup a").trigger("click");
	strictEqual( $( '#mf-notification div h3' ).text(), '[1]' );
	strictEqual( $( '#mf-notification div a' ).text(), 'test reference' );
});

} )( jQuery, mw.mobileFrontend.getModule( 'references' ) );
