const SourceEditorSaveEventHookPayload = require( '../../../src/mobile.editor.overlay/SourceEditorSaveEventHookPayload' ),
	sinon = require( 'sinon' );

QUnit.test( 'SourceEditorSaveEventHookPayload', async ( assert ) => {
	const options = { captchaId: 'foo' };
	const expectedNewOptions = { captchaWord: 'bar' };

	let resumeCalled = false;
	let newOptions = {};
	let abortCalled = false;
	let actualAbortMessage = '';

	const payload = new SourceEditorSaveEventHookPayload(
		{ id: '123' },
		true,
		options,
		( param ) => {
			newOptions = param;
			resumeCalled = true;
		},
		( abortMessage ) => {
			actualAbortMessage = abortMessage;
			abortCalled = true;
		}
	);

	assert.deepEqual( payload.currentPage, { id: '123' } );
	assert.strictEqual( payload.readOnly, true );
	assert.strictEqual( payload.isStopped(), false );
	assert.strictEqual( payload.isAborted(), false );
	assert.strictEqual( payload.options, options );
	assert.strictEqual( resumeCalled, false );

	payload.stop();

	assert.deepEqual( payload.currentPage, { id: '123' } );
	assert.strictEqual( payload.readOnly, true );
	assert.strictEqual( payload.isStopped(), true );
	assert.strictEqual( payload.isAborted(), false );
	assert.strictEqual( payload.options, options );
	assert.strictEqual( resumeCalled, false );

	payload.resume( expectedNewOptions );

	assert.deepEqual( payload.currentPage, { id: '123' } );
	assert.strictEqual( payload.readOnly, true );
	assert.strictEqual( payload.isStopped(), false );
	assert.strictEqual( payload.isAborted(), false );
	assert.strictEqual( newOptions, expectedNewOptions );
	assert.strictEqual( resumeCalled, true );

	payload.abort( 'Abort message' );

	assert.deepEqual( payload.currentPage, { id: '123' } );
	assert.strictEqual( payload.readOnly, true );
	assert.strictEqual( payload.isStopped(), false );
	assert.strictEqual( payload.isAborted(), true );
	assert.strictEqual( actualAbortMessage, 'Abort message' );
	assert.strictEqual( abortCalled, true );
} );

QUnit.test( 'resume and abort are a no-op if abort has already been called', async ( assert ) => {
	const sandbox = sinon.createSandbox();

	const resumeStub = sandbox.stub();
	const abortStub = sandbox.stub();

	const payload = new SourceEditorSaveEventHookPayload(
		{ id: '123' },
		true,
		{},
		resumeStub,
		abortStub
	);

	assert.strictEqual( payload.isStopped(), false );
	assert.strictEqual( payload.isAborted(), false );

	payload.abort( 'Test' );
	payload.abort( 'Test2' );
	payload.resume( {} );

	assert.strictEqual( payload.isStopped(), false );
	assert.strictEqual( payload.isAborted(), true );
	assert.true(
		abortStub.calledOnce,
		'Abort callback should have been called once'
	);
	assert.true(
		resumeStub.notCalled,
		'Resume callback should have not been called'
	);
} );

QUnit.test( 'SourceEditorSaveEventHookPayload#setTemplate stores template, args and callback', ( assert ) => {
	const payload = new SourceEditorSaveEventHookPayload( {}, false, {}, () => {} );
	const callback = () => {};

	payload.setTemplate( 'captcha-panel', '<div>{{text}}</div>', { text: 'solve me' }, callback );

	assert.strictEqual( payload.getTemplate( 'captcha-panel' ), '<div>{{text}}</div>', 'template stored' );
	assert.deepEqual( payload.getTemplateArgs( 'captcha-panel' ), { text: 'solve me' }, 'args stored' );
	assert.strictEqual( payload.getTemplateRenderedCallback( 'captcha-panel' ), callback, 'callback stored' );
} );

QUnit.test( 'SourceEditorSaveEventHookPayload#setTemplate defaults callback to null', ( assert ) => {
	const payload = new SourceEditorSaveEventHookPayload( {}, false, {}, () => {} );

	payload.setTemplate( 'captcha-panel', '<div/>', {} );

	assert.strictEqual( payload.getTemplateRenderedCallback( 'captcha-panel' ), null, 'callback defaults to null' );
} );

QUnit.test( 'SourceEditorSaveEventHookPayload#getTemplate returns undefined for unknown panel', ( assert ) => {
	const payload = new SourceEditorSaveEventHookPayload( {}, false, {}, () => {} );

	assert.strictEqual( payload.getTemplate( 'captcha-panel' ), undefined, 'undefined for unset panel' );
} );

QUnit.test( 'SourceEditorSaveEventHookPayload#getTemplateArgs returns empty object for unknown panel', ( assert ) => {
	const payload = new SourceEditorSaveEventHookPayload( {}, false, {}, () => {} );

	assert.deepEqual( payload.getTemplateArgs( 'captcha-panel' ), {}, 'empty object for unset panel' );
} );
