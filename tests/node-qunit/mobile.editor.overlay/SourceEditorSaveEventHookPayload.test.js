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
