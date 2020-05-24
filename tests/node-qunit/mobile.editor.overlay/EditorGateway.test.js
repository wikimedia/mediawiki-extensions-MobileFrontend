let sandbox, EditorGateway, spy, postStub, apiReject, apiHappy, apiRvNoSection,
	apiCaptchaFail, apiAbuseFilterDisallow, apiAbuseFilterWarning, apiAbuseFilterOther,
	apiTestError, apiReadOnly, apiExpiredToken, apiWithSectionLine, apiHappyTestContent,
	apiEmptySuccessResponse, apiNoSectionLine, apiRejectHttp,
	happyResponse;
const
	util = require( '../../../src/mobile.startup/util' ),
	API_REQUEST_DATA = {
		title: 'test',
		action: 'edit',
		errorformat: 'html',
		errorlang: undefined,
		errorsuselocal: 1,
		formatversion: 2,
		summary: 'summary',
		captchaid: undefined,
		captchaword: undefined
	},
	captcha = {
		type: 'image',
		mime: 'image/png',
		id: '1852528679',
		url: '/w/index.php?title=Especial:Captcha/image&wpCaptchaId=1852528679'
	},
	apiReadOnlyResponse = {
		error: {
			code: 'readonly',
			info: 'The wiki is currently in read-only mode.',
			readonlyreason: 'This wiki is currently being upgraded to a newer software version.'
		}
	},
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	sinon = require( 'sinon' ),
	oo = require( '../utils/oo' ),
	mediaWiki = require( '../utils/mw' );

QUnit.module( 'MobileFrontend mobile.editor.overlay/EditorGateway', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		EditorGateway = require( '../../../src/mobile.editor.overlay/EditorGateway' );
		happyResponse = util.Deferred().resolve( {
			query: {
				pages: [
					{
						revisions: [
							{
								timestamp: '2013-05-15T00:30:26Z',
								content: 'section'
							}
						]
					}
				]
			}
		} );
		apiHappy = new mw.Api();
		apiReject = new mw.Api();
		apiRvNoSection = new mw.Api();
		apiCaptchaFail = new mw.Api();
		apiAbuseFilterDisallow = new mw.Api();
		apiAbuseFilterWarning = new mw.Api();
		apiAbuseFilterOther = new mw.Api();
		apiTestError = new mw.Api();
		apiReadOnly = new mw.Api();
		apiExpiredToken = new mw.Api();
		apiWithSectionLine = new mw.Api();
		apiHappyTestContent = new mw.Api();
		apiRejectHttp = new mw.Api();
		apiEmptySuccessResponse = new mw.Api();
		apiNoSectionLine = new mw.Api();
		sandbox.stub( apiCaptchaFail, 'postWithToken' ).returns(
			util.Deferred().resolve( {
				edit: {
					result: 'Failure',
					captcha: captcha
				}
			} )
		);
		spy = sandbox.stub( apiHappy, 'get' ).returns( happyResponse );
		sandbox.stub( apiReject, 'get' ).returns( happyResponse );
		sandbox.stub( apiRejectHttp, 'get' ).returns( happyResponse );
		sandbox.stub( apiHappyTestContent, 'get' ).returns( happyResponse );
		sandbox.stub( apiEmptySuccessResponse, 'get' ).returns( happyResponse );
		sandbox.stub( apiAbuseFilterDisallow, 'get' ).returns( happyResponse );
		sandbox.stub( apiAbuseFilterOther, 'get' ).returns( happyResponse );
		sandbox.stub( apiTestError, 'get' ).returns( happyResponse );
		sandbox.stub( apiExpiredToken, 'get' ).returns( happyResponse );
		sandbox.stub( apiWithSectionLine, 'get' ).returns( happyResponse );
		sandbox.stub( apiReadOnly, 'get' ).returns( happyResponse );
		sandbox.stub( apiAbuseFilterWarning, 'get' ).returns( happyResponse );
		sandbox.stub( apiCaptchaFail, 'get' ).returns( happyResponse );
		sandbox.stub( apiRvNoSection, 'get' ).returns(
			util.Deferred().resolve( {
				error: {
					code: 'rvnosuchsection'
				}
			} )
		);
		sandbox.stub( apiReject, 'postWithToken' ).returns( util.Deferred().resolve(
			{
				error: {
					code: 'error code'
				}
			}
		) );
		sandbox.stub( apiRejectHttp, 'postWithToken' ).returns( util.Deferred().reject() );
		postStub = sandbox.stub( apiHappy, 'postWithToken' ).returns(
			util.Deferred().resolve( {
				edit: {
					result: 'Success'
				}
			} )
		);
		sandbox.stub( apiEmptySuccessResponse, 'postWithToken' ).returns( util.Deferred().resolve( {} ) );
		sandbox.stub( apiHappyTestContent, 'post' ).returns( util.Deferred().resolve( {
			parse: {
				title: 'test',
				text: {
					'*': '<h1>Heading 1</h1><h2>Heading 2</h2><p>test content</p>'
				},
				sections: {}
			}
		} ) );
		sandbox.stub( apiNoSectionLine, 'post' ).returns( util.Deferred().resolve( {
			parse: {
				title: 'test',
				text: {
					'*': 'test content'
				},
				sections: {}
			}
		} ) );
		sandbox.stub( apiWithSectionLine, 'post' ).returns( util.Deferred().resolve( {
			parse: {
				title: 'test',
				text: {
					'*': 'test content'
				},
				sections: {
					0: {
						line: 'Test section',
						anchor: 'Test_section'
					},
					1: {
						line: 'Test section2',
						anchor: 'Test_section2'
					}
				}
			}
		} ) );
		sandbox.stub( apiExpiredToken, 'postWithToken' )
			.onFirstCall().returns( util.Deferred().resolve( {
				edit: {
					result: 'Success'
				}
			} ) );
		sandbox.stub( apiAbuseFilterWarning, 'postWithToken' ).returns(
			util.Deferred().resolve( {
				edit: {
					code: 'abusefilter-warning-usuwanie-tekstu',
					info: 'Hit AbuseFilter: Usuwanie du\u017cej ilo\u015bci tekstu',
					warning: 'horrible desktop-formatted message',
					result: 'Failure'
				}
			} )
		);
		sandbox.stub( apiAbuseFilterDisallow, 'postWithToken' ).returns(
			util.Deferred().resolve( {
				edit: {
					code: 'abusefilter-disallow',
					info: 'Scary filter',
					warning: 'horrible desktop-formatted message',
					result: 'Failure'
				}
			} )
		);
		sandbox.stub( apiAbuseFilterOther, 'postWithToken' ).returns(
			util.Deferred().resolve( {
				edit: {
					code: 'abusefilter-something',
					info: 'Scary filter',
					warning: 'horrible desktop-formatted message',
					result: 'Failure'
				}
			} )
		);
		sandbox.stub( apiTestError, 'postWithToken' ).returns(
			util.Deferred().resolve( {
				edit: {
					code: 'testerror',
					result: 'Failure'
				}
			} )
		);
		sandbox.stub( apiReadOnly, 'postWithToken' ).returns( util.Deferred().reject( 'readonly', apiReadOnlyResponse ) );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#getContent (no section)', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiHappy,
		title: 'MediaWiki:Test.css'
	} );

	return gateway.getContent().then( function () {
		assert.ok( spy.calledWith( {
			action: 'query',
			prop: [ 'revisions', 'info' ],
			rvprop: [ 'content', 'timestamp' ],
			titles: 'MediaWiki:Test.css',
			intestactions: 'edit',
			intestactionsdetail: 'full',
			formatversion: 2
		} ), 'rvsection not passed to api request' );
	} );
} );

QUnit.test( '#getContent', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiHappy,
		title: 'test',
		sectionId: '1'
	} );

	return gateway.getContent().then( function ( resp ) {
		assert.strictEqual( resp.text, 'section', 'return section content' );
		assert.strictEqual( resp.blockinfo, null );
		return gateway.getContent();
	} ).then( function () {
		assert.strictEqual( spy.callCount, 1, 'cache content' );
	} );
} );

QUnit.test( '#getContent, new page', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiHappy,
		title: 'test',
		isNewPage: true
	} );

	return gateway.getContent().then( function ( resp ) {
		assert.strictEqual( resp.text, '', 'return empty section' );
		assert.strictEqual( resp.blockinfo, undefined );
		assert.notOk( spy.called, 'don\'t try to retrieve content using API' );
	} );
} );

QUnit.test( '#getContent, missing section', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiRvNoSection,
		title: 'test',
		sectionId: '1'
	} );

	assert.rejects( gateway.getContent(), /^rvnosuchsection$/, 'return error code' );
} );

QUnit.test( '#getBlockInfo', function ( assert ) {
	const gateway = new EditorGateway( {
			api: apiHappy,
			title: 'test'
		} ),
		blockinfo = {
			blockedby: 'Test'
		},
		pageObj = {
			revisions: [
				{}
			],
			actions: {
				edit: [
					{
						code: 'blocked',
						data: {
							blockinfo: blockinfo
						}
					}
				]
			}
		};

	assert.strictEqual( blockinfo, gateway.getBlockInfo( pageObj ) );
} );

QUnit.test( '#save, success', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiHappy,
		title: 'test',
		sectionId: '1'
	} );

	return gateway.getContent().then( function () {
		gateway.setContent( 'section 1' );
		assert.strictEqual( gateway.hasChanged, true, 'hasChanged is true' );
		return gateway.save( {
			summary: 'summary'
		} );
	} ).then( function () {
		assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
		assert.strictEqual( postStub.calledWithMatch( 'csrf', util.extend( {}, API_REQUEST_DATA, {
			section: '1',
			text: 'section 1',
			basetimestamp: '2013-05-15T00:30:26Z',
			starttimestamp: '2013-05-15T00:30:26Z'
		} ) ), true, 'save first section' );
	} );
} );

QUnit.test( '#save, new page', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiHappy,
		title: 'Talk:test',
		isNewPage: true
	} );

	gateway.getContent();
	gateway.setContent( 'section 0' );
	return gateway.save( {
		summary: 'summary'
	} ).then( function () {
		assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
		assert.ok( postStub.calledWithMatch( 'csrf', util.extend( {}, API_REQUEST_DATA, {
			title: 'Talk:test',
			text: 'section 0',
			summary: 'summary',
			captchaid: undefined,
			captchaword: undefined,
			basetimestamp: undefined,
			starttimestamp: undefined
		} ) ), 'save lead section' );
	} );
} );

QUnit.test( '#save, after #setPrependText', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiHappy,
		title: 'test'
	} );

	gateway.setPrependText( 'abc' );
	return gateway.save( {
		summary: 'summary'
	} ).then( function () {
		assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
		assert.ok( postStub.calledWithMatch( 'csrf', util.extend( {}, API_REQUEST_DATA, {
			prependtext: 'abc'
		} ) ), 'prepend text' );
	} );
} );

QUnit.test( '#save, submit CAPTCHA', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiHappy,
		title: 'test',
		sectionId: '1'
	} );

	return gateway.getContent().then( function () {
		gateway.setContent( 'section 1' );
	} ).then( function () {
		return gateway.save( {
			summary: 'summary',
			captchaId: 123,
			captchaWord: 'abc'
		} );
	} ).then( function () {
		assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
		assert.ok( postStub.calledWithMatch( 'csrf', util.extend( {}, API_REQUEST_DATA, {
			section: '1',
			text: 'section 1',
			captchaid: 123,
			captchaword: 'abc',
			basetimestamp: '2013-05-15T00:30:26Z',
			starttimestamp: '2013-05-15T00:30:26Z'
		} ) ), 'save first section' );
	} );
} );

QUnit.test( '#save, request failure', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiRejectHttp,
		title: 'test',
		sectionId: '1'
	} );

	return gateway.getContent().then( function () {
		gateway.setContent( 'section 1' );
		assert.rejects( gateway.save(), function ( given ) {
			assert.propEqual( given, {}, 'called with correct arguments' );

			return true;
		}, 'call fail' );
	} );
} );

QUnit.test( '#save, API failure', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiReject,
		title: 'test',
		sectionId: '1'
	} );

	return gateway.getContent().then( function () {
		gateway.setContent( 'section 1' );
		assert.rejects( gateway.save(), function ( given ) {
			assert.propEqual( given, {
				error: { code: 'error code' }
			}, 'called with correct arguments' );

			return true;
		}, 'call fail' );
	} );
} );

QUnit.test( '#save, CAPTCHA response with image URL', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiCaptchaFail,
		title: 'test',
		sectionId: '1'
	} );

	return gateway.getContent().then( function () {
		gateway.setContent( 'section 1' );
		assert.rejects( gateway.save(), function ( given ) {
			assert.propEqual( given, {
				edit: {
					result: 'Failure',
					captcha: {
						type: 'image',
						mime: 'image/png',
						id: '1852528679',
						url: '/w/index.php?title=Especial:Captcha/image&wpCaptchaId=1852528679'
					}
				}
			}, 'called with correct arguments' );

			return true;
		}, 'call fail' );
	} );
} );

QUnit.test( '#save, AbuseFilter warning', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiAbuseFilterWarning,
		title: 'test',
		sectionId: '1'
	} );

	return gateway.getContent().then( function () {
		gateway.setContent( 'section 1' );

		assert.rejects( gateway.save(), function ( given ) {
			assert.propEqual( given, {
				edit: {
					code: 'abusefilter-warning-usuwanie-tekstu',
					info: 'Hit AbuseFilter: Usuwanie dużej ilości tekstu',
					warning: 'horrible desktop-formatted message',
					result: 'Failure'
				}
			}, 'called with correct arguments' );

			return true;
		}, 'call fail' );
	} );
} );

QUnit.test( '#save, AbuseFilter disallow', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiAbuseFilterDisallow,
		title: 'test',
		sectionId: '1'
	} );

	return gateway.getContent().then( function () {
		gateway.setContent( 'section 1' );

		assert.rejects( gateway.save(), function ( given ) {
			assert.propEqual( given, {
				edit: {
					code: 'abusefilter-disallow',
					info: 'Scary filter',
					warning: 'horrible desktop-formatted message',
					result: 'Failure'
				}
			}, 'called with correct arguments' );

			return true;
		}, 'call fail' );
	} );
} );

QUnit.test( '#save, AbuseFilter other', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiAbuseFilterOther,
		title: 'test',
		sectionId: '1'
	} );

	return gateway.getContent().then( function () {
		gateway.setContent( 'section 1' );

		assert.rejects( gateway.save(), function ( given ) {
			assert.propEqual( given, {
				edit: {
					code: 'abusefilter-something',
					info: 'Scary filter',
					warning: 'horrible desktop-formatted message',
					result: 'Failure'
				}
			}, 'called with correct arguments' );

			return true;
		}, 'call fail' );
	} );
} );

QUnit.test( '#save, extension errors', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiTestError,
		title: 'test',
		sectionId: '1'
	} );

	return gateway.getContent().then( function () {
		gateway.setContent( 'section 1' );

		assert.rejects( gateway.save(), function ( given ) {
			assert.propEqual( given, {
				edit: {
					code: 'testerror',
					result: 'Failure'
				}
			}, 'called with correct arguments' );

			return true;
		}, 'call fail' );
	} );
} );
QUnit.test( '#save, read-only error', function ( assert ) {
	const gateway = new EditorGateway( {
			api: apiReadOnly,
			title: 'test',
			sectionId: '1'
		} ),
		resolveSpy = sandbox.spy(),
		rejectSpy = sandbox.spy(),
		done = assert.async(),
		expectedReturnValue = {
			error: {
				code: 'readonly',
				info: 'The wiki is currently in read-only mode.',
				readonlyreason: 'This wiki is currently being upgraded to a newer software version.'
			}
		};

	gateway.getContent().then( function () {
		gateway.setContent( 'section 1' );
		return gateway.save();
	} ).then( resolveSpy, rejectSpy ).then( function () {
		assert.strictEqual( rejectSpy.calledWith( expectedReturnValue ), true );
		assert.strictEqual( resolveSpy.called, false, 'don\'t call resolve' );
		done();
	} );

} );

QUnit.test( '#save, unknown errors', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiEmptySuccessResponse,
		title: 'test',
		sectionId: '1'
	} );

	return gateway.getContent().then( function () {
		gateway.setContent( 'section 1' );

		assert.rejects( gateway.save(), function ( given ) {
			assert.propEqual( given, {}, 'called with correct arguments' );

			return true;
		}, 'call fail' );
	} );
} );

QUnit.test( '#save, without changes', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiHappy,
		title: 'test',
		sectionId: '1'
	} );

	return gateway.getContent().then( function () {
		return gateway.setContent( 'section' );
	} ).then( function () {
		assert.strictEqual( gateway.hasChanged, false, 'hasChanged is false' );
		return gateway.save( {
			summary: 'summary'
		} );
	} ).then( function () {
		assert.ok( apiHappy.postWithToken.calledWithMatch( 'csrf', util.extend( {}, API_REQUEST_DATA, {
			section: '1',
			text: 'section',
			basetimestamp: '2013-05-15T00:30:26Z',
			starttimestamp: '2013-05-15T00:30:26Z'
		} ) ), 'save first section' );
	} );
} );

QUnit.test( '#EditorGateway', function ( assert ) {
	const gateway = new EditorGateway( {
			api: apiHappyTestContent,
			title: 'Test',
			sectionId: '1'
		} ),
		resolveSpy = sandbox.spy();

	return gateway.getPreview( { text: 'test content' } )
		.then( resolveSpy )
		.then( function () {
			assert.ok( apiHappyTestContent.post.calledWithMatch( {
				text: 'test content'
			} ) );
			assert.ok( resolveSpy.calledWith( {
				line: '',
				id: '',
				text: '<h1>Heading 1</h1><h2>Heading 2</h2><p>test content</p>'
			} ) );
		} );

} );

QUnit.test( '#EditorGateway, check without sectionLine', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiNoSectionLine,
		title: 'Test',
		sectionId: '1'
	} );

	return gateway.getPreview( {
		text: 'test content'
	} ).then( function ( section ) {
		assert.strictEqual( section.line, '', 'Ok, no section line returned' );
	} );
} );

QUnit.test( '#EditorGateway, check with sectionLine', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiWithSectionLine,
		title: 'Test',
		sectionId: '1'
	} );

	return gateway.getPreview( {
		text: 'test content'
	} ).then( function ( section ) {
		assert.strictEqual( section.line, 'Test section', 'Ok, section line returned' );
		assert.strictEqual( section.id, 'Test_section', 'Ok, section ID returned' );
	} );
} );

QUnit.test( '#save, when token has expired', function ( assert ) {
	const gateway = new EditorGateway( {
		api: apiExpiredToken,
		title: 'MediaWiki:Test.css'
	} );

	return gateway.getContent().then( function () {
		gateway.setContent( 'section 1' );

		return gateway.save().then( function () {
			assert.strictEqual( apiExpiredToken.postWithToken.callCount, 1, 'check the spy was called twice' );
		} );
	} );
} );
