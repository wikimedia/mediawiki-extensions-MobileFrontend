( function ( M, $ ) {
	var Api = M.require( 'api' ).Api;

	QUnit.module( 'MobileFrontend api', {
		setup: function () {
			var self = this,
				server = this.sandbox.useFakeServer();
			server.xhr.onCreate = function ( xhr ) {
				// FIXME: smelly, sinon.extend and sinon.EventTarget are not public interface
				xhr.upload = window.sinon.extend( {}, window.sinon.EventTarget );
				self.lastXhr = xhr;
			};
		}
	} );

	QUnit.test( 'default instance', 1, function ( assert ) {
		assert.ok( M.require( 'api' ) instanceof Api, 'return default instance' );
	} );

	QUnit.test( 'progress event', 1, function ( assert ) {
		var spy = this.sandbox.spy(),
			api = new Api(),
			request;

		api.on( 'progress', spy );
		request = api.post();
		this.lastXhr.upload.dispatchEvent( {
			type: 'progress',
			lengthComputable: true,
			loaded: 1,
			total: 2
		} );
		assert.ok( spy.calledWith( request, 0.5 ), 'emit progress event' );
	} );

	QUnit.module( 'MobileFrontend api.Api', {
		setup: function () {
			var self = this,
				requests = this.requests = [];
			this.api = new Api();
			this.sandbox.stub( mw.Api.prototype, 'ajax', function () {
				var request = $.extend( {
					abort: self.sandbox.spy()
				}, $.Deferred() );
				requests.push( request );
				return request;
			} );
		}
	} );

	QUnit.test( '#ajax', 1, function ( assert ) {
		this.api.ajax( {
			falseBool: false,
			trueBool: true,
			list: [ 'one', 2, 'three' ],
			normal: 'test'
		} );
		assert.ok(
			mw.Api.prototype.ajax.calledWithMatch( {
				trueBool: true,
				list: 'one|2|three',
				normal: 'test'
			} ),
			'set defaults and transform boolean and array data'
		);
	} );

	QUnit.test( '#abort', 2, function ( assert ) {
		this.api.get( {
			a: 1
		} );
		this.api.post( {
			b: 2
		} );
		this.api.abort();
		$.each( this.requests, function ( i, request ) {
			assert.ok( request.abort.calledOnce, 'abort request number ' + i );
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
