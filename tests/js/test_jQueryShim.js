( function ( $ ) {

module( 'MobileFrontend jQueryShim.js', {
	setup: function() {
		var section = '<div class="t_section_heading"></div>';
		$( '<div id="mfetest">' + section + '<div id="t_section_1">' + section + '</div>' ).
			appendTo( '#qunit-fixture' );
		$( '<div id="mfe-test-classes" class="test hello-world goodbye camelCase">for testing classes</div>' ).appendTo( document.body );
	},
	teardown: function() {
		$( '#mfe-test-classes' ).remove();
	}
} );

test( 'Basic selector support (#id)', function() {
	strictEqual( jQueryShim( '#t_section_1' ).length, 1, 'only one element matches this selector' );
} );

test( 'Basic selector support (.className)', function() {
	strictEqual( jQueryShim( '.t_section_heading' ).length, 2, 'only two elements matches this selector' );
} );

test( 'Basic selector support (tag name)', function() {
	strictEqual( jQueryShim( 'body' ).length, 1, 'only one element matches this selector' );
} );

test( 'addClass', function() {
	var el = $( '<div>' )[0];
	jQueryShim( el ).addClass( 'foo' );
	jQueryShim( el ).addClass( 'bar' );
	strictEqual( $( el ).hasClass( 'foo' ), true);
	strictEqual( $( el ).hasClass( 'bar' ), true);
} );

test( 'hasClass', function() {
	var el = $( '#mfe-test-classes' )[0];
	strictEqual( jQueryShim( el ).hasClass( 'test' ), true, 'testing classes #1' );
	strictEqual( jQueryShim( el ).hasClass( 'hello-world' ), true, 'testing classes #2' );
	strictEqual( jQueryShim( el ).hasClass( 'goodbye' ), true, 'testing classes #3' );
	strictEqual( jQueryShim( el ).hasClass( 'camelCase' ), true, 'testing classes #4' );
	strictEqual( jQueryShim( el ).hasClass( 'camelcase' ), false, 'testing classes #5 (case sensitive)' );
	strictEqual( jQueryShim( el ).hasClass( 'hello' ), false, 'testing classes #6 (impartial matches)' );
} );

test( 'removeClass', function() {
	var el = $( '<div />' )[ 0 ];
	jQueryShim( el ).addClass( 'foo' );
	jQueryShim( el ).addClass( 'bar' );
	jQueryShim( el ).removeClass( 'foo' );
	jQueryShim( el ).removeClass( 'bar' );
	strictEqual( $( el ).hasClass( 'foo' ), false);
	strictEqual( $( el ).hasClass( 'bar' ), false);
} );

}( jQuery ) );
