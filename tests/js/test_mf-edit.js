( function ( $, m ) {

module( 'MobileFrontend: mf-edit', {
	setup: function() {
		$( '#editform, textarea.segment,#wpSummary' ).remove();
		$( '<form id="editform"><textarea></textarea></form>' ).appendTo( document.body );
		$( '<input id="wpSummary">' ).appendTo( document.body );
	},
	teardown: function() {
		$( '#editform, textarea.segment,#wpSummary' ).remove();
	}
} );

test( 'concatTextAreas basic line', function() {
	var val = 'Test';
	$( 'form#editform textarea' ).val( val );
	m.init();
	strictEqual( m.concatTextAreas(), val, 'check value same' );
} );

test( 'concatTextAreas headings', function() {
	var val = 'Test\n\n==Hello World==\nHello';
	$( 'form#editform textarea' ).val( val );
	m.init();
	strictEqual( m.concatTextAreas(), val, 'check value same' );
} );

test( 'concatTextAreas headings 2', function() {
	var val = 'Test\n\n==1.0==\nText of 1.0\n===1.1===\nText of 1.1\n==2.0==\nText of 2.0';
	$( 'form#editform textarea' ).val( val );
	m.init();
	strictEqual( m.concatTextAreas(), val, 'check value same' );
} );

test( 'concatTextAreas headings 3', function() {
	var val = 'Test\n\n==1.0==\n\nText of 1.0\n\n===1.1===\n\nText of 1.1\n==2.0==\nText of 2.0';
	$( 'form#editform textarea' ).val( val );
	m.init();
	strictEqual( m.concatTextAreas(), val, 'check value same' );
} );


} )( jQuery, mw.mobileFrontend.getModule( 'edit' ) );
