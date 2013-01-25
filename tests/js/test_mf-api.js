( function ( M, $ ) {

var api = M.require( 'api' );

module( 'MobileFrontend api (config)' );

test( '$.ajaxSetup()', function() {
	var xhr = sinon.useFakeXMLHttpRequest(), request;
	xhr.onCreate = function( xhr ) {
		request = xhr;
	};
	$.ajax( {
		data: { test: 'test' }
	} );
	strictEqual( request.url.indexOf( M.getApiUrl() ), 0, 'set default API URL' );
	xhr.restore();
} );


module( 'MobileFrontend api', {
  setup: function() {
    sinon.stub( $, 'ajax' );
  },
  teardown: function() {
    $.ajax.restore();
  }
} );

test( 'ajax()', function() {
	api.ajax( {
    falseBool: false,
    trueBool: true,
    list: [ 'one', 2, 'three' ],
    normal: 'test'
	} );
	ok(
		$.ajax.calledWith( {
			data: {
				trueBool: true,
				list: 'one|2|three',
				normal: 'test'
			}
		} ),
		'transform boolean and array data'
	);
} );

test( 'get()', function() {
  api.get( { a: 1 } );
  ok( $.ajax.calledWith( { type: 'GET', data: { a: 1 } } ), 'call with type: GET' );
} );

test( 'post()', function() {
  api.post( { a: 1 } );
  ok( $.ajax.calledWith( { type: 'POST', data: { a: 1 } } ), 'call with type: POST' );
} );

}( mw.mobileFrontend, jQuery ) );
