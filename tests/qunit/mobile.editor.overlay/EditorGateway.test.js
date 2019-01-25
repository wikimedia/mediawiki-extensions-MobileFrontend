( function ( M ) {
	var EditorGateway = M.require( 'mobile.editor.api/EditorGateway' ),
		sandbox, spy, postStub, apiReject, apiHappy, apiRvNoSection,
		apiCaptchaFail, apiAbuseFilterDisallow, apiAbuseFilterWarning, apiAbuseFilterOther,
		apiTestError, apiReadOnly, apiExpiredToken, apiWithSectionLine, apiHappyTestContent,
		apiEmptySuccessResponse, apiNoSectionLine, apiRejectHttp,
		util = M.require( 'mobile.startup/util' ),
		happyResponse,
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
		};

	QUnit.module( 'MobileFrontend mobile.editor.overlay/EditorGateway', {
		beforeEach: function () {
			sandbox = this.sandbox;
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
					],
					userinfo: {
						id: 0
					}
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
							line: 'Testsection'
						},
						1: {
							line: 'Testsection2'
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
		}
	} );

	QUnit.test( '#getContent (no section)', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiHappy,
			title: 'MediaWiki:Test.css'
		} );

		gateway.getContent();
		assert.ok( spy.calledWith( {
			action: 'query',
			prop: [ 'revisions', 'info' ],
			meta: 'userinfo',
			rvprop: [ 'content', 'timestamp' ],
			titles: 'MediaWiki:Test.css',
			intestactions: 'edit',
			intestactionsdetail: 'full',
			uiprop: 'options',
			formatversion: 2
		} ), 'rvsection not passed to api request' );
	} );

	QUnit.test( '#getContent', function ( assert ) {
		var gateway;

		gateway = new EditorGateway( {
			api: apiHappy,
			title: 'test',
			sectionId: 1
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
		var gateway = new EditorGateway( {
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
		var gateway = new EditorGateway( {
			api: apiRvNoSection,
			title: 'test',
			sectionId: 1
		} );

		assert.rejects( gateway.getContent(), /^rvnosuchsection$/, 'return error code' );
	} );

	QUnit.test( '#getBlockInfo', function ( assert ) {
		var gateway = new EditorGateway( {
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
		var gateway = new EditorGateway( {
			api: apiHappy,
			title: 'test',
			sectionId: 1
		} );

		return gateway.getContent().then( function () {
			gateway.setContent( 'section 1' );
			assert.strictEqual( gateway.hasChanged, true, 'hasChanged is true' );
			return gateway.save( {
				summary: 'summary'
			} );
		} ).then( function () {
			assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
			assert.ok( postStub.calledWith( 'csrf', {
				action: 'edit',
				title: 'test',
				section: 1,
				text: 'section 1',
				summary: 'summary',
				captchaid: undefined,
				captchaword: undefined,
				basetimestamp: '2013-05-15T00:30:26Z',
				starttimestamp: '2013-05-15T00:30:26Z'
			} ), 'save first section' );
		} );
	} );

	QUnit.test( '#save, new page', function ( assert ) {
		var gateway = new EditorGateway( {
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
			assert.ok( postStub.calledWith( 'csrf', {
				action: 'edit',
				title: 'Talk:test',
				text: 'section 0',
				summary: 'summary',
				captchaid: undefined,
				captchaword: undefined,
				basetimestamp: undefined,
				starttimestamp: undefined
			} ), 'save lead section' );
		} );
	} );

	QUnit.test( '#save, after #setPrependText', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiHappy,
			title: 'test'
		} );

		gateway.setPrependText( 'abc' );
		return gateway.save( {
			summary: 'summary'
		} ).then( function () {
			assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
			assert.ok( postStub.calledWith( 'csrf', {
				action: 'edit',
				title: 'test',
				prependtext: 'abc',
				summary: 'summary',
				captchaid: undefined,
				captchaword: undefined,
				basetimestamp: undefined,
				starttimestamp: undefined
			} ), 'prepend text' );
		} );
	} );

	QUnit.test( '#save, submit CAPTCHA', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiHappy,
			title: 'test',
			sectionId: 1
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
			assert.ok( postStub.calledWith( 'csrf', {
				action: 'edit',
				title: 'test',
				section: 1,
				text: 'section 1',
				summary: 'summary',
				captchaid: 123,
				captchaword: 'abc',
				basetimestamp: '2013-05-15T00:30:26Z',
				starttimestamp: '2013-05-15T00:30:26Z'
			} ), 'save first section' );
		} );
	} );

	QUnit.test( '#save, request failure', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiRejectHttp,
			title: 'test',
			sectionId: 1
		} );

		return gateway.getContent().then( function () {
			gateway.setContent( 'section 1' );
			assert.rejects( gateway.save(), function ( given ) {
				assert.deepEqual( given, {
					type: 'error',
					details: 'http'
				}, 'called with correct arguments' );

				return true;
			}, 'call fail' );
		} );
	} );

	QUnit.test( '#save, API failure', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiReject,
			title: 'test',
			sectionId: 1
		} );

		return gateway.getContent().then( function () {
			gateway.setContent( 'section 1' );
			assert.rejects( gateway.save(), function ( given ) {
				assert.deepEqual( given, {
					type: 'error',
					details: 'error code'
				}, 'called with correct arguments' );

				return true;
			}, 'call fail' );
		} );
	} );

	QUnit.test( '#save, CAPTCHA response with image URL', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiCaptchaFail,
			title: 'test',
			sectionId: 1
		} );

		return gateway.getContent().then( function () {
			gateway.setContent( 'section 1' );
			assert.rejects( gateway.save(), function ( given ) {
				assert.deepEqual( given, {
					type: 'captcha',
					details: captcha
				}, 'called with correct arguments' );

				return true;
			}, 'call fail' );
		} );
	} );

	QUnit.test( '#save, AbuseFilter warning', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiAbuseFilterWarning,
			title: 'test',
			sectionId: 1
		} );

		return gateway.getContent().then( function () {
			gateway.setContent( 'section 1' );

			assert.rejects( gateway.save(), function ( given ) {
				assert.deepEqual( given, {
					type: 'abusefilter',
					details: {
						type: 'warning',
						message: 'horrible desktop-formatted message'
					}
				}, 'called with correct arguments' );

				return true;
			}, 'call fail' );
		} );
	} );

	QUnit.test( '#save, AbuseFilter disallow', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiAbuseFilterDisallow,
			title: 'test',
			sectionId: 1
		} );

		return gateway.getContent().then( function () {
			gateway.setContent( 'section 1' );

			assert.rejects( gateway.save(), function ( given ) {
				assert.deepEqual( given, {
					type: 'abusefilter',
					details: {
						type: 'disallow',
						message: 'horrible desktop-formatted message'
					}
				}, 'called with correct arguments' );

				return true;
			}, 'call fail' );
		} );
	} );

	QUnit.test( '#save, AbuseFilter other', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiAbuseFilterOther,
			title: 'test',
			sectionId: 1
		} );

		return gateway.getContent().then( function () {
			gateway.setContent( 'section 1' );

			assert.rejects( gateway.save(), function ( given ) {
				assert.deepEqual( given, {
					type: 'abusefilter',
					details: {
						type: 'other',
						message: 'horrible desktop-formatted message'
					}
				}, 'called with correct arguments' );

				return true;
			}, 'call fail' );
		} );
	} );

	QUnit.test( '#save, extension errors', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiTestError,
			title: 'test',
			sectionId: 1
		} );

		return gateway.getContent().then( function () {
			gateway.setContent( 'section 1' );

			assert.rejects( gateway.save(), function ( given ) {
				assert.deepEqual( given, {
					type: 'error',
					details: 'testerror'
				}, 'called with correct arguments' );

				return true;
			}, 'call fail' );
		} );
	} );
	QUnit.test( '#save, read-only error', function ( assert ) {
		var gateway = new EditorGateway( {
				api: apiReadOnly,
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = sandbox.spy(),
			failSpy = sandbox.spy(),
			done = assert.async(),
			expectedReturnValue = {
				type: 'readonly',
				details: {
					code: 'readonly',
					info: 'The wiki is currently in read-only mode.',
					readonlyreason: 'This wiki is currently being upgraded to a newer software version.'
				}
			};

		gateway.getContent().then( function () {
			gateway.setContent( 'section 1' );
			return gateway.save();
		} ).then( doneSpy, failSpy ).then( function () {
			assert.strictEqual( failSpy.calledWith( expectedReturnValue ), true );
			assert.strictEqual( doneSpy.called, false, 'don\'t call done' );
			done();
		} );

	} );

	QUnit.test( '#save, unknown errors', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiEmptySuccessResponse,
			title: 'test',
			sectionId: 1
		} );

		return gateway.getContent().then( function () {
			gateway.setContent( 'section 1' );

			assert.rejects( gateway.save(), function ( given ) {
				assert.deepEqual( given, {
					type: 'error',
					details: 'unknown'
				}, 'called with correct arguments' );

				return true;
			}, 'call fail' );
		} );
	} );

	QUnit.test( '#save, without changes', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiHappy,
			title: 'test',
			sectionId: 1
		} );

		return gateway.getContent().then( function () {
			return gateway.setContent( 'section' );
		} ).then( function () {
			assert.strictEqual( gateway.hasChanged, false, 'hasChanged is false' );
			return gateway.save( {
				summary: 'summary'
			} );
		} ).then( function () {
			assert.ok( apiHappy.postWithToken.calledWith( 'csrf', {
				action: 'edit',
				title: 'test',
				section: 1,
				text: 'section',
				summary: 'summary',
				captchaid: undefined,
				captchaword: undefined,
				basetimestamp: '2013-05-15T00:30:26Z',
				starttimestamp: '2013-05-15T00:30:26Z'
			} ), 'save first section' );
		} );
	} );

	QUnit.test( '#EditorGateway', function ( assert ) {
		var gateway = new EditorGateway( {
				api: apiHappyTestContent,
				title: 'Test',
				sectionId: 1
			} ),
			doneSpy = sandbox.spy();

		return gateway.getPreview( { text: 'test content' } )
			.then( doneSpy )
			.then( function () {
				assert.ok( apiHappyTestContent.post.calledWithMatch( {
					text: 'test content'
				} ) );
				assert.ok( doneSpy.calledWith( {
					line: '',
					text: '<h1>Heading 1</h1><h2>Heading 2</h2><p>test content</p>'
				} ) );
			} );

	} );

	QUnit.test( '#EditorGateway, check without sectionLine', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiNoSectionLine,
			title: 'Test',
			sectionId: 1
		} );

		return gateway.getPreview( {
			text: 'test content'
		} ).then( function ( section ) {
			assert.strictEqual( section.line, '', 'Ok, no section line returned' );
		} );
	} );

	QUnit.test( '#EditorGateway, check with sectionLine', function ( assert ) {
		var gateway = new EditorGateway( {
			api: apiWithSectionLine,
			title: 'Test',
			sectionId: 1
		} );

		return gateway.getPreview( {
			text: 'test content'
		} ).then( function ( section ) {
			assert.strictEqual( section.line, 'Testsection', 'Ok, section line returned' );
		} );
	} );

	QUnit.test( '#save, when token has expired', function ( assert ) {
		var gateway = new EditorGateway( {
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

}( mw.mobileFrontend ) );
