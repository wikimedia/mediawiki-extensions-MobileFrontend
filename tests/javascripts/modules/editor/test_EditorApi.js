( function ( M, $ ) {

	var EditorApi = M.require( 'modules/editor/EditorApi' );

	QUnit.module( 'MobileFrontend modules/editor/EditorApi', {
		setup: function() {
			sinon.stub( EditorApi.prototype, 'get' ).returns( $.Deferred().resolve( {
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

	QUnit.test( '#getSection', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'test' } );

		editorApi.getSection( 1 ).done( function( resp ) {
			assert.deepEqual(
				resp,
				{ id: 1, timestamp: '2013-05-15T00:30:26Z', content: 'section' },
				'return section content'
			);
		} );
		editorApi.getSection( 1 );
		assert.ok( editorApi.get.calledOnce, 'cache sections' );
	} );

	QUnit.test( '#getSection, new page', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'test', isNew: true } );

		editorApi.getSection( 0 ).done( function( resp ) {
			assert.deepEqual(
				resp,
				{ id: 0, content: '' },
				'return empty section'
			);
		} );
		assert.ok( !editorApi.get.called, "don't try to retrieve section using API" );
	} );

	QUnit.test( '#getSection, missing section', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'test', isNew: true } ), doneSpy = sinon.spy();

		EditorApi.prototype.get.restore();
		sinon.stub( EditorApi.prototype, 'get' ).returns( $.Deferred().resolve( {
			"error":{ "code": "rvnosuchsection" }
		} ) );

		editorApi.getSection( 1 ).done( doneSpy ).fail( function( error ) {
			assert.strictEqual( error, 'rvnosuchsection', "return error code" );
		} );
		assert.ok( !doneSpy.called, "don't call done" );
	} );

	QUnit.test( '#stageSection', 1, function( assert ) {
		var editorApi = new EditorApi( { title: 'test' } );

		editorApi.getSection( 1 ).done( function() {
			editorApi.stageSection( 1, 'updated section' );
			editorApi.getSection( 1 ).done( function( resp ) {
				assert.strictEqual( resp.content, 'updated section', 'update cache' );
			} );
		} );
	} );

	QUnit.test( '#save, success', 3, function( assert ) {
		var editorApi = new EditorApi( { title: 'test' } );

		sinon.stub( editorApi, 'post' ).returns( $.Deferred().resolve() );

		editorApi.getSection( 1 );
		editorApi.stageSection( 1, 'section 1' );
		editorApi.getSection( 2 );
		editorApi.stageSection( 2, 'section 2' );
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
			assert.ok( editorApi.post.calledWith( {
				action: 'edit',
				title: 'test',
				section: 2,
				text: 'section 2',
				summary: 'summary',
				token: 'fake token',
				basetimestamp: '2013-05-15T00:30:26Z',
				starttimestamp: '2013-05-15T00:30:26Z'
			} ), 'save second section' );
			assert.strictEqual( editorApi.getStagedCount(), 0, 'reset the stage' );
		} );
	} );

	QUnit.test( '#save, new page', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'Talk:test', isNew: true } );

		sinon.stub( editorApi, 'post' ).returns( $.Deferred().resolve() );

		editorApi.getSection( 0 );
		editorApi.stageSection( 0, 'section 0' );
		editorApi.save( 'summary' ).done( function() {
			assert.ok( editorApi.post.calledWith( {
				action: 'edit',
				title: 'Talk:test',
				section: 0,
				text: 'section 0',
				summary: 'summary',
				token: 'fake token',
				basetimestamp: undefined,
				starttimestamp: undefined
			} ), 'save lead section' );
			assert.strictEqual( editorApi.getStagedCount(), 0, 'reset the stage' );
		} );
	} );

	QUnit.test( '#save, request failure', 3, function( assert ) {
		var editorApi = new EditorApi( { title: 'test' } ), doneSpy = sinon.spy(), failSpy = sinon.spy();

		sinon.stub( editorApi, 'post' ).returns( $.Deferred().reject() );

		editorApi.getSection( 1 );
		editorApi.stageSection( 1, 'section 1' );
		editorApi.getSection( 2 );
		editorApi.stageSection( 2, 'section 2' );

		editorApi.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( 'HTTP error' ), "call fail" );
		assert.ok( !doneSpy.called, "don't call done" );
		assert.ok( editorApi.post.calledOnce, 'stop after first failure' );
	} );

	QUnit.test( '#save, API failure', 3, function( assert ) {
		var editorApi = new EditorApi( { title: 'test' } ), doneSpy = sinon.spy(), failSpy = sinon.spy();

		sinon.stub( editorApi, 'post' ).returns( $.Deferred().resolve(
			{ error: { code: 'error code' } }
		) );

		editorApi.getSection( 1 );
		editorApi.stageSection( 1, 'section 1' );
		editorApi.getSection( 2 );
		editorApi.stageSection( 2, 'section 2' );

		editorApi.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( 'error code' ), "call fail" );
		assert.ok( !doneSpy.called, "don't call done" );
		assert.ok( editorApi.post.calledOnce, 'stop after first failure' );
	} );

	QUnit.test( '#save, without staged sections', 2, function( assert ) {
		var editorApi = new EditorApi( { title: 'test' } );

		assert.throws(
			function() {
				editorApi.save();
			},
			/staged section/,
			'throw an error'
		);
		assert.ok( !editorApi.getToken.called, "don't get the token" );
	} );

}( mw.mobileFrontend, jQuery ) );
