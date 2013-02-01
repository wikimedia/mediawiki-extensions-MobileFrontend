( function ( M, $ ) {

var Api = M.require( 'api' ).Api, api, xhrs;

module( 'MobileFrontend api' );

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

test( 'default instance', function() {
	ok( M.require( 'api' ) instanceof Api, 'return default instance' );
} );

module( 'MobileFrontend api.Api', {
	setup: function() {
		api = new Api();
		xhrs = [];
		sinon.stub( $, 'ajax', function() {
			var xhr = { abort: sinon.spy() };
			xhrs.push( xhr );
			return xhr;
		} );
	},
	teardown: function() {
		$.ajax.restore();
	}
} );

test( '#ajax', function() {
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

test( '#get', function() {
	api.get( { a: 1 } );
	ok( $.ajax.calledWith( { type: 'GET', data: { a: 1 } } ), 'call with type: GET' );
} );

test( '#post', function() {
	api.post( { a: 1 } );
	ok( $.ajax.calledWith( { type: 'POST', data: { a: 1 } } ), 'call with type: POST' );
} );

test( '#abort', function() {
	api.get( { a: 1 } );
	api.post( { b: 2 } );
	api.abort();
	xhrs.forEach( function( xhr, i ) {
		ok( xhr.abort.calledOnce, 'abort request number ' + i );
	} );
} );

}( mw.mobileFrontend, jQuery ) );
