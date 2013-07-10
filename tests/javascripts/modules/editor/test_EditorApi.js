( function ( M, $ ) {

	var EditorApi = M.require( 'modules/editor/EditorApi' );

	QUnit.module( 'MobileFrontend modules/editor/EditorApi', {
		setup: function() {
			this.spy = sinon.stub( EditorApi.prototype, 'get' ).returns( $.Deferred().resolve( {
				"query": {
					"pages": {
						"1": {
							"revisions": [
								{
								"timestamp": "2013-05-15T00:30:26Z",
								"*": "section"
							}
							]
						}
					}
				}
			} ) );
			sinon.stub( EditorApi.prototype, 'getToken' ).returns( $.Deferred().resolve( 'fake token' ) );
		},
		teardown: function() {
			EditorApi.prototype.get.restore();
			EditorApi.prototype.getToken.restore();
		}
	} );

	QUnit.test( '#getContent (no section)', 1, function( assert ) {
		var editorApi = new EditorApi( { title: 'MediaWiki:Test.css' } );

		editorApi.getContent();
		assert.ok( this.spy.calledWith( {
				action: 'query',
				prop: 'revisions',
				rvprop: [ 'content', 'timestamp' ],
				titles: 'MediaWiki:Test.css'
			} ), 'rvsection not passed to api request' );
	} );

	QUnit.test( '#getContent', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'test', sectionId: 1 } );

		editorApi.getContent().done( function( resp ) {
			assert.strictEqual( resp, 'section', 'return section content' );
		} );
		editorApi.getContent();
		assert.ok( editorApi.get.calledOnce, 'cache content' );
	} );

	QUnit.test( '#getContent, new page', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'test', isNew: true } );

		editorApi.getContent().done( function( resp ) {
			assert.strictEqual( resp, '', 'return empty section' );
		} );
		assert.ok( !editorApi.get.called, "don't try to retrieve content using API" );
	} );

	QUnit.test( '#getContent, missing section', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'test', sectionId: 1 } ), doneSpy = sinon.spy();

		EditorApi.prototype.get.restore();
		sinon.stub( EditorApi.prototype, 'get' ).returns( $.Deferred().resolve( {
			"error": { "code": "rvnosuchsection" }
		} ) );

		editorApi.getContent().done( doneSpy ).fail( function( error ) {
			assert.strictEqual( error, 'rvnosuchsection', "return error code" );
		} );
		assert.ok( !doneSpy.called, "don't call done" );
	} );

	QUnit.test( '#save, success', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'test', sectionId: 1 } );

		sinon.stub( editorApi, 'post' ).returns( $.Deferred().resolve() );

		editorApi.getContent();
		editorApi.setContent( 'section 1' );
		editorApi.save( 'summary' ).done( function() {
			assert.ok( editorApi.post.calledWith( {
				action: 'edit',
				title: 'test',
				section: 1,
				text: 'section 1',
				summary: 'summary',
				token: 'fake token',
				basetimestamp: '2013-05-15T00:30:26Z',
				starttimestamp: '2013-05-15T00:30:26Z'
			} ), 'save first section' );
		} );
		assert.strictEqual( editorApi.hasChanged, false, 'reset hasChanged' );
	} );

	QUnit.test( '#save, new page', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'Talk:test', isNew: true } );

		sinon.stub( editorApi, 'post' ).returns( $.Deferred().resolve() );

		editorApi.getContent();
		editorApi.setContent( 'section 0' );
		editorApi.save( 'summary' ).done( function() {
			assert.ok( editorApi.post.calledWith( {
				action: 'edit',
				title: 'Talk:test',
				text: 'section 0',
				summary: 'summary',
				token: 'fake token',
				basetimestamp: undefined,
				starttimestamp: undefined
			} ), 'save lead section' );
		} );
		assert.strictEqual( editorApi.hasChanged, false, 'reset hasChanged' );
	} );

	QUnit.test( '#save, request failure', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'test', sectionId: 1 } ),
			doneSpy = sinon.spy(), failSpy = sinon.spy();

		sinon.stub( editorApi, 'post' ).returns( $.Deferred().reject() );

		editorApi.getContent();
		editorApi.setContent( 'section 1' );

		editorApi.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( 'HTTP error' ), "call fail" );
		assert.ok( !doneSpy.called, "don't call done" );
	} );

	QUnit.test( '#save, API failure', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'test', sectionId: 1 } ),
			doneSpy = sinon.spy(), failSpy = sinon.spy();

		sinon.stub( editorApi, 'post' ).returns( $.Deferred().resolve(
			{ error: { code: 'error code' } }
		) );

		editorApi.getContent();
		editorApi.setContent( 'section 1' );

		editorApi.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( 'error code' ), "call fail" );
		assert.ok( !doneSpy.called, "don't call done" );
	} );

	QUnit.test( '#save, without changes', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'test', sectionId: 1 } );

		assert.throws(
			function() {
				editorApi.save();
			},
			/no changes/i,
			'throw an error'
		);
		assert.ok( !editorApi.getToken.called, "don't get the token" );
	} );

}( mw.mobileFrontend, jQuery ) );
