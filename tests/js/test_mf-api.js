( function ( M, $ ) {

var Api = M.require( 'api' ).Api;

module( 'MobileFrontend api', {
	setup: function() {
		var self = this;
		this.xhr = sinon.useFakeXMLHttpRequest();
		this.xhr.onCreate = function( xhr ) {
			xhr.upload = sinon.extend( {}, sinon.EventTarget );
			self.lastXhr = xhr;
		};
	},
	teardown: function() {
		this.xhr.restore();
	}
} );

test( '$.ajaxSetup()', function() {
	$.ajax( {
		data: { test: 'test' }
	} );
	strictEqual( this.lastXhr.url.indexOf( M.getApiUrl() ), 0, 'set default API URL' );
} );

test( 'default instance', function() {
	ok( M.require( 'api' ) instanceof Api, 'return default instance' );
} );

// FIXME: uncomment when https://bugzilla.wikimedia.org/show_bug.cgi?id=44921 is resolved
/*
test( 'progress event', function() {
	var spy = sinon.spy(),
		api = new Api();
	api.post().on( 'progress', spy );
	this.lastXhr.upload.dispatchEvent( { type: 'progress' } );
	ok( spy.calledWith( { type: 'progress' } ), 'forward progress event from xhr' );
} );
*/


module( 'MobileFrontend api.Api', {
	setup: function() {
		var requests = this.requests = [];
		this.api = new Api();
		sinon.stub( $, 'ajax', function() {
			var request = { abort: sinon.spy() };
			requests.push( request );
			return request;
		} );
	},
	teardown: function() {
		$.ajax.restore();
	}
} );

test( '#ajax', function() {
	this.api.ajax( {
		falseBool: false,
		trueBool: true,
		list: [ 'one', 2, 'three' ],
		normal: 'test'
	} );
	ok(
		$.ajax.calledWithMatch( {
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
	this.api.get( { a: 1 } );
	ok( $.ajax.calledWithMatch( { type: 'GET', data: { a: 1 } } ), 'call with type: GET' );
} );

test( '#post', function() {
	this.api.post( { a: 1 } );
	ok( $.ajax.calledWithMatch( { type: 'POST', data: { a: 1 } } ), 'call with type: POST' );
} );

test( '#abort', function() {
	this.api.get( { a: 1 } );
	this.api.post( { b: 2 } );
	this.api.abort();
	this.requests.forEach( function( request, i ) {
		ok( request.abort.calledOnce, 'abort request number ' + i );
	} );
} );

}( mw.mobileFrontend, jQuery ) );
