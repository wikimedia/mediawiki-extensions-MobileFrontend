( function ( M, $ ) {

	var module = M.require( 'modules/edit' ),
		EditApi = module._EditApi, EditOverlay = module._EditOverlay;


	QUnit.module( 'MobileFrontend modules/edit.EditOverlay', {
		setup: function() {
			sinon.stub( EditApi.prototype, 'getSection' ).
				withArgs( 0 ).returns( $.Deferred().resolve( { section: 0, content: 'section 0' } ) ).
				withArgs( 1 ).returns( $.Deferred().resolve( { section: 1, content: 'section 1' } ) ).
				withArgs( 2 ).returns( $.Deferred().resolve( { section: 2, content: 'section 2' } ) );
		},
		teardown: function() {
			EditApi.prototype.getSection.restore();
		}
	} );

	QUnit.test( '#initialize, with given page and section', 3, function( assert ) {
		var apiSpy = sinon.spy( EditApi.prototype, 'initialize' ),
			editOverlay = new EditOverlay( { pageId: 1, section: 0, sectionCount: 3 } );

		assert.ok( apiSpy.calledOnce, 'initialize EditApi once' );
		assert.ok( apiSpy.calledWith( { pageId: 1 } ), 'initialize EditApi with correct pageId' );
		assert.strictEqual( editOverlay.$content.val(), 'section 0', 'load correct section' );
	} );

	QUnit.test( '#initialize, Previous button', 3, function( assert ) {
		var editOverlay = new EditOverlay( { pageId: 1, section: 1, sectionCount: 3 } );

		editOverlay.$prev.click();
		assert.strictEqual( editOverlay.$content.val(), 'section 0', 'load previous section' );
		assert.ok( editOverlay.$prev.is( ':disabled' ), 'disable Previous on lead section' );
		editOverlay.$next.click();
		assert.ok( editOverlay.$prev.is( ':enabled' ), 'enable Previous on non-lead section' );
	} );

	QUnit.test( '#initialize, Next button', 3, function( assert ) {
		var editOverlay = new EditOverlay( { pageId: 1, section: 1, sectionCount: 3 } );

		editOverlay.$next.click();
		assert.strictEqual( editOverlay.$content.val(), 'section 2', 'load next section' );
		assert.ok( editOverlay.$next.is( ':disabled' ), 'disable Next on last section' );
		editOverlay.$prev.click();
		assert.ok( editOverlay.$next.is( ':enabled' ), 'enable Next on not last section' );
	} );


	QUnit.module( 'MobileFrontend modules/edit.EditApi', {
		setup: function() {
			sinon.stub( EditApi.prototype, 'get' ).returns( $.Deferred().resolve( {
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
			sinon.stub( EditApi.prototype, 'getToken' ).returns( $.Deferred().resolve( 'fake token' ) );
		},
		teardown: function() {
			EditApi.prototype.get.restore();
			EditApi.prototype.getToken.restore();
		}
	} );

	QUnit.test( '#getSection', 2, function( assert ) {
		var editApi = new EditApi( { pageId: 1 } );

		editApi.getSection( 1 ).done( function( resp ) {
			assert.deepEqual(
				resp,
				{ section: 1, timestamp: '2013-05-15T00:30:26Z', content: 'section' },
				'return section content'
			);
		} );
		editApi.getSection( 1 );
		assert.ok( editApi.get.calledOnce, 'cache sections' );
	} );

	QUnit.test( '#save, success', 2, function( assert ) {
		var editApi = new EditApi( { pageId: 1 } );

		sinon.stub( editApi, 'post' ).returns( $.Deferred().resolve() );

		editApi.getSection( 1 );
		editApi.stageSection( 1, 'section 1' );
		editApi.getSection( 2 );
		editApi.stageSection( 2, 'section 2' );
		editApi.save().done( function() {
			assert.ok( editApi.post.calledWith( {
				action: 'edit',
				pageid: 1,
				section: 1,
				text: 'section 1',
				token: 'fake token',
				basetimestamp: '2013-05-15T00:30:26Z',
				starttimestamp: '2013-05-15T00:30:26Z'
			} ), 'save first section' );
			assert.ok( editApi.post.calledWith( {
				action: 'edit',
				pageid: 1,
				section: 2,
				text: 'section 2',
				token: 'fake token',
				basetimestamp: '2013-05-15T00:30:26Z',
				starttimestamp: '2013-05-15T00:30:26Z'
			} ), 'save second section' );
		} );
	} );

	QUnit.test( '#save, request failure', 3, function( assert ) {
		var editApi = new EditApi( { pageId: 1 } ), doneSpy = sinon.spy(), failSpy = sinon.spy();

		sinon.stub( editApi, 'post' ).returns( $.Deferred().reject() );

		editApi.getSection( 1 );
		editApi.stageSection( 1, 'section 1' );
		editApi.getSection( 2 );
		editApi.stageSection( 2, 'section 2' );

		editApi.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( 'HTTP error' ), "call fail" );
		assert.ok( !doneSpy.called, "don't call done" );
		assert.ok( editApi.post.calledOnce, 'stop after first failure' );
	} );

	QUnit.test( '#save, API failure', 3, function( assert ) {
		var editApi = new EditApi( { pageId: 1 } ), doneSpy = sinon.spy(), failSpy = sinon.spy();

		sinon.stub( editApi, 'post' ).returns( $.Deferred().resolve(
			{ error: { code: 'error code' } }
		) );

		editApi.getSection( 1 );
		editApi.stageSection( 1, 'section 1' );
		editApi.getSection( 2 );
		editApi.stageSection( 2, 'section 2' );

		editApi.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( 'error code' ), "call fail" );
		assert.ok( !doneSpy.called, "don't call done" );
		assert.ok( editApi.post.calledOnce, 'stop after first failure' );
	} );

}( mw.mobileFrontend, jQuery ) );
