const SourceEditorSaveEventHookPayload = require( '../../../src/mobile.editor.overlay/SourceEditorSaveEventHookPayload' );

QUnit.test( 'SourceEditorSaveEventHookPayload', async ( assert ) => {
	const options = { captchaId: 'foo' };
	const expectedNewOptions = { captchaWord: 'bar' };

	let resumeCalled = false;
	let newOptions = {};

	const payload = new SourceEditorSaveEventHookPayload(
		{ id: '123' },
		true,
		options,
		( param ) => {
			newOptions = param;
			resumeCalled = true;
		}
	);

	assert.deepEqual( payload.currentPage, { id: '123' } );
	assert.strictEqual( payload.readOnly, true );
	assert.strictEqual( payload.isStopped(), false );
	assert.strictEqual( payload.options, options );
	assert.strictEqual( resumeCalled, false );

	payload.stop();

	assert.deepEqual( payload.currentPage, { id: '123' } );
	assert.strictEqual( payload.readOnly, true );
	assert.strictEqual( payload.isStopped(), true );
	assert.strictEqual( payload.options, options );
	assert.strictEqual( resumeCalled, false );

	payload.resume( expectedNewOptions );

	assert.deepEqual( payload.currentPage, { id: '123' } );
	assert.strictEqual( payload.readOnly, true );
	assert.strictEqual( payload.isStopped(), false );
	assert.strictEqual( newOptions, expectedNewOptions );
	assert.strictEqual( resumeCalled, true );
} );
