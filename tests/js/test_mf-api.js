( function ( M, $ ) {

var Api = M.require( 'api' ).Api, stub;

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

test( '#ajax, with FormData', function() {
	var data = new FormData();
	// add a property that should not disappear
	data.testBool = false;
	this.api.ajax( data );
	strictEqual( $.ajax.args[0][0].data.testBool, false, 'use unmodified FormData' );
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

module( 'MobileFrontend api.getToken', {
	setup: function() {
		var params, corsParams, corsData,
			editDeferred = $.Deferred().resolve( { tokens: { 'edittoken': '123' } } ),
			uploadAnonDeferred = $.Deferred().resolve( { tokens: { 'uploadtoken': '+\\' } } ),
			corsDeferred = $.Deferred().resolve( { tokens: { 'watchtoken': 'zyx' } } ),
			warningDeferred = $.Deferred().resolve( { warning: 'you passed a bad watch token' } );

		this.api = new Api();
		stub = sinon.stub( this.api , 'ajax' );
		params = {
			url: M.getApiUrl(),
			xhrFields: { withCredentials: true }
		};
		corsData = { action: 'tokens', type: 'watch',
			origin: M.getOrigin()
		};
		corsParams = {
			url: 'http://commons.wikimedia.org/w/api.php',
			xhrFields: { withCredentials: true }
		};

		stub.withArgs( { action: 'tokens', type: 'rainbows' }, params ).returns( warningDeferred );
		stub.withArgs( { action: 'tokens', type: 'edit' }, params ).returns( editDeferred );
		stub.withArgs( { action: 'tokens', type: 'upload' }, params ).returns( uploadAnonDeferred );
		stub.withArgs( corsData, corsParams ).returns( corsDeferred );
	},
	teardown: function() {
		stub.restore();
	}
} );

test( '#getToken - successful edit token', function() {
	this.api.getToken( 'edit' ).done( function( token ) {
		strictEqual( token, '123', 'Got token' );
	} );
} );

test( '#getToken - load from cache', function() {
	this.api.getToken( 'edit' );
	this.api.getToken( 'edit' ).done( function( token ) { // this comes via cache
		strictEqual( token, '123', 'Test for bad token name' );
	} );

	strictEqual( stub.getCall( 1 ), null, 'Ajax stub was only called once' );
} );

test( '#getToken - cors edit token', function() {
	this.api.getToken( 'watch', 'http://commons.wikimedia.org/w/api.php' ).done( function( token ) {
		strictEqual( token, 'zyx', 'Correctly passed via cors' );
	} );
} );

test( '#getToken - default to edit', function() {
	this.api.getToken().done( function( token ) {
		strictEqual( token, '123', 'We get an edit token by default (most common)' );
	} );
} );

test( '#getToken - get anon token', function() {
	this.api.getToken( 'upload' ).fail( function( msg ) {
		strictEqual( msg, 'Anonymous token.', 'No token given - user must be anon' );
	} );
} );

test( '#getToken - bad type of token', function() {
	this.api.getToken( 'rainbows' ).fail( function( msg ) {
		strictEqual( msg, 'Bad token name.', 'Test for bad token name' );
	} );
} );

}( mw.mobileFrontend, jQuery ) );
