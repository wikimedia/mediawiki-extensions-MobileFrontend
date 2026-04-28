let sandbox, messageStub, getContentStub, previewResolve,
	BlockMessageDetails, EditorGateway, EditorOverlayBase, SourceEditorOverlay;
const
	testUrl = '/w/index.php?title=User:Test',
	jQuery = require( '../utils/jQuery' ),
	sinon = require( 'sinon' ),
	util = require( '../../../src/mobile.startup/util' ),
	oo = require( '../utils/oo' ),
	dom = require( '../utils/dom' ),
	makeFakeHookRegistry = require( '../utils/makeFakeHookRegistry' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' );

QUnit.module( 'MobileFrontend mobile.editor.overlay/SourceEditorOverlay', {
	beforeEach: function () {
		/* eslint-disable-next-line camelcase */
		global.__non_webpack_require__ = require( '../webpackRequire.stub' );
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		global.OO.ui.MultilineTextInputWidget = function () {
			return {
				$element: global.$( '<div>' )
			};
		};

		EditorGateway = require( '../../../src/mobile.editor.overlay/EditorGateway' );
		EditorOverlayBase = require( '../../../src/mobile.editor.overlay/EditorOverlayBase' );
		SourceEditorOverlay = require( '../../../src/mobile.editor.overlay/SourceEditorOverlay' );
		BlockMessageDetails = require( '../../../src/mobile.editor.overlay/BlockMessageDetails' );

		// prevent event logging requests
		sandbox.stub( SourceEditorOverlay.prototype, 'log' ).returns( util.Deferred().resolve() );

		messageStub = sandbox.stub( BlockMessageDetails.prototype, 'initialize' );
		getContentStub = sandbox.stub( EditorGateway.prototype, 'getContent' );
		sandbox.stub( mw, 'confirmCloseWindow' ).returns( {
			release: function () {}
		} );
		sandbox.stub( window, 'scrollTo' );
		sandbox.stub( mw.util, 'getUrl' ).returns( '/w/index.php?title=User:Test' );
		sandbox.stub( mw.config, 'get' )
			.withArgs( 'wgPageName' ).returns( 'User:Test' )
			.withArgs( 'wgRelevantPageName' ).returns( 'User:Test' )
			.withArgs( 'wgRevisionId' ).returns( 123 )
			.withArgs( 'wgArticleId' ).returns( 321 )
			.withArgs( 'wgNamespaceNumber' ).returns( 2 )
			.withArgs( 'wgIsMainPage' ).returns( false )
			.withArgs( 'wgFormattedNamespaces' ).returns( { 2: 'User' } )
			.withArgs( 'wgNamespaceIds' ).returns( { user: 2 } )
			.withArgs( 'wgVisualEditorConfig' ).returns( { namespaces: [ 1, 2 ] } );
		const stubTitle = {
			getUrl: function () {
				return '/w/index.php?title=User:Test';
			},
			getPrefixedText: function () {
				return 'User:Test';
			}
		};
		sandbox.stub( mw.Title, 'makeTitle' ).returns( stubTitle );
		sandbox.stub( mw.Title, 'newFromText' ).returns( stubTitle );
		getContentStub.returns( util.Deferred().resolve( {
			text: 'section 0',
			blockinfo: null
		} ) );
		previewResolve = util.Deferred().resolve( { text: '\npreviewtest' } );
		sandbox.stub( EditorGateway.prototype, 'getPreview' )
			.returns( previewResolve );
		// TODO remove after anonwarning experiment concludes (T408484)
		sandbox.stub( mw.loader, 'using' ).withArgs( 'ext.testKitchen' ).returns( util.Deferred().resolve() );
		// HACK sandbox.stub( mw, 'testKitchen' ) complains about testKitchen prop not being
		// defined, which is true as mw-node-qunit does not define it. What's the pattern for
		// mocking mw.* optional props provided by extensions?
		mw.testKitchen = {
			compat: {
				getExperiment: () => ( {
					isAssignedGroup: () => false
				} )
			}
		};
		this.originalHookFactory = mw.hook;
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
		mw.testKitchen = undefined;
		mw.hook = this.originalHookFactory;
	}
} );

QUnit.test( '#initialize, blocked user', ( assert ) => {
	const dBlockedContent = util.Deferred().resolve( {
			text: 'section 0',
			blockinfo: {
				blockedby: 'Test',
				blockexpiry: 'infinity',
				blockreason: 'Testreason'
			}
		} ),
		done = assert.async();

	sandbox.stub( mw.Api.prototype, 'get' ).returns(
		util.Deferred().resolve( {
			parse: {
				text: 'Testreason'
			}
		} )
	);

	new SourceEditorOverlay( {
		title: 'test.css'
	}, dBlockedContent ).getLoadingPromise().then( () => {}, () => {
		done();
		assert.true(
			messageStub.calledWithMatch( {
				partial: false,
				creator: {
					name: 'Test',
					url: testUrl
				},
				expiry: null,
				duration: null,
				reason: 'Testreason'
			} )
		);
	} );
} );

QUnit.test( '#initialize, with given page and section', ( assert ) => {
	const editorOverlay = new SourceEditorOverlay( {
		title: 'test',
		sectionId: '0'
	} );

	// The gateway is initialized with the correct properties,
	// particularly the correct section ID.
	assert.strictEqual( editorOverlay.gateway.title, 'test' );
	assert.strictEqual( editorOverlay.gateway.oldId, undefined );
	assert.strictEqual( editorOverlay.gateway.sectionId, '0' );

	return editorOverlay.getLoadingPromise().then( () => {
		assert.strictEqual( editorOverlay.$content.val(), 'section 0', 'load correct section' );
	} );
} );

QUnit.test( '#initialize, without a section', ( assert ) => {
	const editorOverlay = new SourceEditorOverlay( {
		title: 'test.css'
	} );

	return getContentStub().then( () => {
		assert.strictEqual( editorOverlay.gateway.title, 'test.css' );
		assert.strictEqual( editorOverlay.gateway.oldId, undefined );
		assert.strictEqual( editorOverlay.gateway.sectionId, undefined );
	} );
} );

QUnit.test( '#preview', ( assert ) => {
	const editorOverlay = new SourceEditorOverlay( {
		title: 'test',
		sectionId: '0'
	} );

	editorOverlay.onStageChanges();

	return previewResolve.then( () => {
		assert.strictEqual( editorOverlay.$preview.text(), '\n\npreviewtest', 'preview loaded correctly' );
	} );
} );

QUnit.test( '#initialize, as anonymous', ( assert ) => {
	const editorOverlay = new SourceEditorOverlay( {
		title: 'Main_page',
		isAnon: true
	} );

	return editorOverlay.getLoadingPromise()
		.then( () => mw.loader.using( 'ext.testKitchen' ) )
		.then( () => {
			assert.true( editorOverlay.$anonWarning.length > 0, 'Editorwarning (IP will be saved) visible.' );
			assert.true( editorOverlay.$el.find( '.anonymous' ).length > 0, 'Continue login has a second class.' );
		} );
} );

// TODO remove after anonwarning experiment concludes (T408484)
QUnit.test( '#initialize, as anonymous Growth experiment treatment group', ( assert ) => {
	mw.testKitchen = {
		compat: {
			getExperiment: () => ( {
				isAssignedGroup: () => true
			} )
		}
	};
	const editorOverlay = new SourceEditorOverlay( {
		title: 'Main_page',
		isAnon: true
	} );

	return editorOverlay.getLoadingPromise()
		.then( () => mw.loader.using( 'ext.testKitchen' ) )
		.then( () => {
			assert.true( editorOverlay.$anonWarning.length > 0, 'Editorwarning (IP will be saved) visible.' );
			assert.true( editorOverlay.$el.find( '.anonymous' ).length > 0, 'Continue login has a second class.' );
			assert.true( editorOverlay.$anonWarning.find( '.description' ).length > 0, 'New treatment group text is shown' );
		} );
} );

QUnit.test( '#handleCaptcha, falls through to super when hook not stopped', ( assert ) => {
	const editorOverlay = new SourceEditorOverlay( { title: 'test', sectionId: '0' } );
	const superStub = sandbox.stub( EditorOverlayBase.prototype, 'handleCaptcha' );
	const details = { type: 'image', mime: 'image/png', id: '123', url: '/captcha' };
	const saveOptions = { summary: 'test' };

	editorOverlay.handleCaptcha( details, saveOptions );

	assert.true( superStub.calledWith( details, saveOptions ), 'calls super.handleCaptcha' );
} );

QUnit.test( '#handleCaptcha, does not fall through to super when hook stopped', ( assert ) => {
	const editorOverlay = new SourceEditorOverlay( { title: 'test', sectionId: '0' } );
	const superStub = sandbox.stub( EditorOverlayBase.prototype, 'handleCaptcha' );
	sandbox.stub( mw, 'hook' ).returns( {
		fire: ( payload ) => {
			payload.stop();
		},
		add: () => {}
	} );

	editorOverlay.handleCaptcha( {}, {} );

	assert.false( superStub.called, 'does not call super.handleCaptcha' );
} );

QUnit.test( '#handleCaptcha, resume updates save options and retries save', ( assert ) => {
	const editorOverlay = new SourceEditorOverlay( { title: 'test', sectionId: '0' } );
	const saveStub = sandbox.stub( editorOverlay.gateway, 'save' ).returns( util.Deferred().promise() );

	let capturedPayload;
	sandbox.stub( mw, 'hook' ).returns( {
		fire: ( payload ) => {
			payload.stop();
			capturedPayload = payload;
		},
		add: () => {}
	} );

	const saveOptions = { summary: 'test' };
	editorOverlay.handleCaptcha( {}, saveOptions );
	capturedPayload.resume( { captchaWord: 'abc' } );

	assert.true( saveStub.calledOnce, 'retried save once' );

	const retriedOptions = saveStub.firstCall.args[ 0 ];
	assert.deepEqual(
		retriedOptions,
		{
			summary: 'test',
			captchaWord: 'abc',
			isRespondingToForcedCaptcha: true,
			editorinterface: 'MobileFrontend-SourceEditor'
		},
		'retried save with updated options'
	);
} );

QUnit.test( '#handleCaptcha, sets solvingAbuseFilterCaptcha flag when hook stopped', ( assert ) => {
	mw.hook = makeFakeHookRegistry();

	const editorOverlay = new SourceEditorOverlay( {
		title: 'test',
		sectionId: '0'
	} );

	const saveStub = sandbox.stub( editorOverlay.gateway, 'save' ).returns( util.Deferred().promise() );

	sandbox.stub( EditorOverlayBase.prototype, 'handleCaptcha' );
	sandbox.stub( mw, 'hook' ).returns( {
		fire: ( payload ) => payload.stop(),
		add: () => {}
	} );

	editorOverlay.handleCaptcha( {}, { summary: 'test' } );

	assert.false(
		saveStub.called,
		'should not retry save when hook stopped without resume'
	);
	assert.true(
		editorOverlay.solvingAbuseFilterCaptcha,
		'solvingAbuseFilterCaptcha should be set when hook stopped'
	);
} );

QUnit.test( '#handleCaptcha, calls afterRender callback when hook sets template', ( assert ) => {
	const editorOverlay = new SourceEditorOverlay( { title: 'test', sectionId: '0' } );
	sandbox.stub( EditorOverlayBase.prototype, 'handleCaptcha' );
	const afterRender = sandbox.spy();

	sandbox.stub( mw, 'hook' ).returns( {
		fire: ( payload ) => {
			payload.stop();
			sandbox.stub( util, 'template' ).returns( { render: () => '<div/>' } );
			payload.setTemplate( 'captcha-panel', '<div/>', {}, afterRender );
		},
		add: () => {}
	} );

	editorOverlay.handleCaptcha( {}, {} );

	assert.true( afterRender.calledOnce, 'afterRender callback called after template render' );
} );

QUnit.test( 'When AF filter prevents an edit the UI goes back to the summary screen', ( assert ) => {
	mw.hook = makeFakeHookRegistry();

	const editorOverlay = new SourceEditorOverlay( {
		title: 'test',
		sectionId: '0'
	} );

	editorOverlay.$el.append(
		'<div class="header-action"><button class="save">Save</button></div>' +
		'<div class="header-cancel"><button class="back">Back</button></div>'
	);

	mw.hook( 'mobileFrontend.sourceEditor.handleCaptcha' )
		.add( ( payload ) => payload.stop() );

	const onStageChangesSpy = sandbox.spy( editorOverlay, 'onStageChanges' );

	editorOverlay.onSaveFailure( {
		edit: {
			captcha: {
				id: '123',
				type: 'hcaptcha'
			}
		}
	}, {} );

	// Simulate buttons being disabled (as onSaveBegin would have done)
	editorOverlay._setSubmitButtonsDisabledProperty( true );

	assert.true(
		editorOverlay.solvingAbuseFilterCaptcha,
		'solvingAbuseFilterCaptcha should be set after AF captcha'
	);

	// Buttons must remain disabled while the captcha is open
	const areButtonsDisabled = () => editorOverlay.$el
		.find( '.header-action button.save, .header-cancel button.back' )
		.toArray().every( ( btn ) => btn.disabled );

	assert.true(
		areButtonsDisabled(),
		'buttons stay disabled while captcha is pending'
	);

	mw.hook( 'confirmEdit.hCaptcha.challengeClosed' ).fire( {
		sourceInterfaceName: 'mobilefrontend-editor'
	} );

	assert.true(
		onStageChangesSpy.calledOnce,
		'onStageChanges should be called when AF captcha is closed unsolved'
	);
	assert.false(
		areButtonsDisabled(),
		'buttons re-enabled after challenge closed'
	);
} );

QUnit.test( 'Closing a non-AF captcha does not return to the summary screen', ( assert ) => {
	mw.hook = makeFakeHookRegistry();

	const editorOverlay = new SourceEditorOverlay( {
		title: 'test',
		sectionId: '0'
	} );

	const onStageChangesSpy = sandbox.spy( editorOverlay, 'onStageChanges' );

	mw.hook( 'confirmEdit.hCaptcha.challengeClosed' ).fire( {
		sourceInterfaceName: 'mobilefrontend-editor'
	} );

	assert.false(
		onStageChangesSpy.called,
		'onStageChanges should not be called when a non-AF captcha is dismissed'
	);
} );
