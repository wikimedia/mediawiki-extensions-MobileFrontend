( function ( M, $) {

var Api = M.require( 'api' ).Api, stub, tokens;

QUnit.module( 'MobileFrontend api', {
	setup: function() {
		var self = this, server = this.sandbox.useFakeServer();
		server.xhr.onCreate = function( xhr ) {
			// FIXME: smelly, sinon.extend and sinon.EventTarget are not public interface
			xhr.upload = sinon.extend( {}, sinon.EventTarget );
			self.lastXhr = xhr;
		};
	}
} );

QUnit.test( 'default instance', 1, function() {
	ok( M.require( 'api' ) instanceof Api, 'return default instance' );
} );

QUnit.test( 'progress event', 1, function() {
	var spy = this.sandbox.spy(), api = new Api(), request;

	api.on( 'progress', spy );
	request = api.post();
	this.lastXhr.upload.dispatchEvent( { type: 'progress', lengthComputable: true, loaded: 1, total: 2 } );
	ok( spy.calledWith( request, 0.5 ),  'emit progress event' );
} );

QUnit.module( 'MobileFrontend api.Api', {
	setup: function() {
		var self = this, requests = this.requests = [];
		this.api = new Api();
		this.sandbox.stub( mw.Api.prototype, 'ajax', function() {
			var request = $.extend( { abort: self.sandbox.spy() }, $.Deferred() );
			requests.push( request );
			return request;
		} );
	}
} );

QUnit.test( '#ajax', 1, function() {
	this.api.ajax( {
		falseBool: false,
		trueBool: true,
		list: [ 'one', 2, 'three' ],
		normal: 'test'
	} );
	ok(
		mw.Api.prototype.ajax.calledWithMatch( {
			trueBool: true,
			list: 'one|2|three',
			normal: 'test'
		} ),
		'set defaults and transform boolean and array data'
	);
} );

QUnit.test( '#abort', 2, function() {
	this.api.get( { a: 1 } );
	this.api.post( { b: 2 } );
	this.api.abort();
	this.requests.forEach( function( request, i ) {
		ok( request.abort.calledOnce, 'abort request number ' + i );
	} );
} );

QUnit.module( 'MobileFrontend api.getToken', {
	setup: function() {
		var params, corsParams, corsData,
			editDeferred = $.Deferred().resolve( { tokens: { 'edittoken': '123' } } ),
			uploadAnonDeferred = $.Deferred().resolve( { tokens: { 'uploadtoken': '+\\' } } ),
			corsDeferred = $.Deferred().resolve( { tokens: { 'watchtoken': 'zyx' } } ),
			warningDeferred = $.Deferred().resolve( { warning: 'you passed a bad watch token' } );

		this.api = new Api();
		stub = this.sandbox.stub( this.api , 'ajax' );
		tokens = {
			editToken: mw.user.tokens.get( 'editToken' ),
			watchToken: mw.user.tokens.get( 'watchToken' )
		};
		params = {
			url: this.api.apiUrl,
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
		this.user = mw.user.getName() || '';
		mw.user.tokens.set( 'editToken', '123' );
		mw.user.tokens.set( 'watchToken', 'zyx' );
		mw.config.set( 'wgUserName', 'EvilPanda' );
	},
	teardown: function() {
		stub.restore();
		mw.user.tokens.set( 'editToken', tokens.editToken );
		mw.user.tokens.set( 'watchToken', tokens.watchToken );
		mw.config.set( 'wgUserName', this.user );
	}
} );

QUnit.test( '#getToken - successful edit token', 1, function() {
	this.api.getToken( 'edit' ).done( function( token ) {
		strictEqual( token, '123', 'Got token' );
	} );
} );

QUnit.test( '#getToken - load from cache', 2, function() {
	this.api.getToken( 'edit' );
	this.api.getToken( 'edit' ).done( function( token ) { // this comes via cache
		strictEqual( token, '123', 'Test for bad token name' );
	} );

	strictEqual( stub.getCall( 1 ), null, 'Ajax stub was only called once' );
} );

QUnit.test( '#getToken - cors edit token', 1, function() {
	this.api.getToken( 'watch', 'http://commons.wikimedia.org/w/api.php' ).done( function( token ) {
		strictEqual( token, 'zyx', 'Correctly passed via cors' );
	} );
} );

QUnit.test( '#getToken - default to edit', 1, function() {
	this.api.getToken().done( function( token ) {
		strictEqual( token, '123', 'We get an edit token by default (most common)' );
	} );
} );

QUnit.test( '#getToken - get anon token', 1, function() {
	this.api.getToken( 'upload' ).fail( function( msg ) {
		strictEqual( msg, 'Anonymous token.', 'No token given - user must be anon' );
	} );
} );

QUnit.test( '#getToken - bad type of token', 1, function() {
	this.api.getToken( 'rainbows' ).fail( function( msg ) {
		strictEqual( msg, 'Bad token name.', 'Test for bad token name' );
	} );
} );

}( mw.mobileFrontend, jQuery) );
