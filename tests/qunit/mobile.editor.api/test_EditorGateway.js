( function ( M, $ ) {
	var EditorGateway = M.require( 'mobile.editor.api/EditorGateway' );

	QUnit.module( 'MobileFrontend mobile.editor.api/EditorGateway', {
		setup: function () {
			this.spy = this.sandbox.stub( mw.Api.prototype, 'get' ).returns( $.Deferred().resolve( {
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
			} ) );
			this.sandbox.stub( mw.Api.prototype, 'getToken' ).returns( $.Deferred().resolve( 'fake token' ) );
		}
	} );

	QUnit.test( '#getContent (no section)', 1, function ( assert ) {
		var gateway = new EditorGateway( {
			api: new mw.Api(),
			title: 'MediaWiki:Test.css'
		} );

		gateway.getContent();
		assert.ok( this.spy.calledWith( {
			action: 'query',
			prop: 'revisions',
			rvprop: [ 'content', 'timestamp' ],
			titles: 'MediaWiki:Test.css',
			meta: 'userinfo',
			uiprop: 'blockinfo',
			formatversion: 2
		} ), 'rvsection not passed to api request' );
	} );

	QUnit.test( '#getContent', 2, function ( assert ) {
		var gateway = new EditorGateway( {
			api: new mw.Api(),
			title: 'test',
			sectionId: 1
		} );

		gateway.getContent().done( function ( resp ) {
			assert.strictEqual( resp, 'section', 'return section content' );
		} );
		gateway.getContent();
		assert.ok( this.spy.calledOnce, 'cache content' );
	} );

	QUnit.test( '#getContent, new page', 2, function ( assert ) {
		var gateway = new EditorGateway( {
			api: new mw.Api(),
			title: 'test',
			isNewPage: true
		} );

		gateway.getContent().done( function ( resp ) {
			assert.strictEqual( resp, '', 'return empty section' );
		} );
		assert.ok( !this.spy.called, 'don\'t try to retrieve content using API' );
	} );

	QUnit.test( '#getContent, missing section', 2, function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy();

		mw.Api.prototype.get.restore();
		this.sandbox.stub( mw.Api.prototype, 'get' ).returns( $.Deferred().resolve( {
			error: {
				code: 'rvnosuchsection'
			}
		} ) );

		gateway.getContent().done( doneSpy ).fail( function ( error ) {
			assert.strictEqual( error, 'rvnosuchsection', 'return error code' );
		} );
		assert.ok( !doneSpy.called, 'don\'t call done' );
	} );

	QUnit.test( '#save, success', 3, function ( assert ) {
		var postStub,
			gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} );

		postStub = this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve(
			{
				edit: {
					result: 'Success'
				}
			}
		) );

		gateway.getContent();
		gateway.setContent( 'section 1' );
		assert.strictEqual( gateway.hasChanged, true, 'hasChanged is true' );
		gateway.save( {
			summary: 'summary'
		} ).done( function () {
			assert.ok( postStub.calledWith( {
				action: 'edit',
				title: 'test',
				section: 1,
				text: 'section 1',
				summary: 'summary',
				captchaid: undefined,
				captchaword: undefined,
				token: 'fake token',
				basetimestamp: '2013-05-15T00:30:26Z',
				starttimestamp: '2013-05-15T00:30:26Z'
			} ), 'save first section' );
		} );
		assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
	} );

	QUnit.test( '#save, new page', 2, function ( assert ) {
		var postStub,
			gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'Talk:test',
				isNewPage: true
			} );

		postStub = this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve(
			{
				edit: {
					result: 'Success'
				}
			}
		) );

		gateway.getContent();
		gateway.setContent( 'section 0' );
		gateway.save( {
			summary: 'summary'
		} ).done( function () {
			assert.ok( postStub.calledWith( {
				action: 'edit',
				title: 'Talk:test',
				text: 'section 0',
				summary: 'summary',
				captchaid: undefined,
				captchaword: undefined,
				token: 'fake token',
				basetimestamp: undefined,
				starttimestamp: undefined
			} ), 'save lead section' );
		} );
		assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
	} );

	QUnit.test( '#save, after #setPrependText', 2, function ( assert ) {
		var postStub,
			gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test'
			} );

		postStub = this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve(
			{
				edit: {
					result: 'Success'
				}
			}
		) );

		gateway.setPrependText( 'abc' );
		gateway.save( {
			summary: 'summary'
		} ).done( function () {
			assert.ok( postStub.calledWith( {
				action: 'edit',
				title: 'test',
				prependtext: 'abc',
				summary: 'summary',
				captchaid: undefined,
				captchaword: undefined,
				token: 'fake token',
				basetimestamp: undefined,
				starttimestamp: undefined
			} ), 'prepend text' );
		} );
		assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
	} );

	QUnit.test( '#save, submit CAPTCHA', 2, function ( assert ) {
		var postStub,
			gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} );

		postStub = this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve(
			{
				edit: {
					result: 'Success'
				}
			}
		) );

		gateway.getContent();
		gateway.setContent( 'section 1' );
		gateway.save( {
			summary: 'summary',
			captchaId: 123,
			captchaWord: 'abc'
		} ).done( function () {
			assert.ok( postStub.calledWith( {
				action: 'edit',
				title: 'test',
				section: 1,
				text: 'section 1',
				summary: 'summary',
				captchaid: 123,
				captchaword: 'abc',
				token: 'fake token',
				basetimestamp: '2013-05-15T00:30:26Z',
				starttimestamp: '2013-05-15T00:30:26Z'
			} ), 'save first section' );
		} );
		assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
	} );

	QUnit.test( '#save, request failure', 2, function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().reject() );

		gateway.getContent();
		gateway.setContent( 'section 1' );

		gateway.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( {
			type: 'error',
			details: 'http'
		} ), 'call fail' );
		assert.ok( !doneSpy.called, 'don\'t call done' );
	} );

	QUnit.test( '#save, API failure', 2, function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve(
			{
				error: {
					code: 'error code'
				}
			}
		) );

		gateway.getContent();
		gateway.setContent( 'section 1' );

		gateway.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( {
			type: 'error',
			details: 'error code'
		} ), 'call fail' );
		assert.ok( !doneSpy.called, 'don\'t call done' );
	} );

	QUnit.test( '#save, CAPTCHA response with image URL', 2, function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			captcha = {
				type: 'image',
				mime: 'image/png',
				id: '1852528679',
				url: '/w/index.php?title=Especial:Captcha/image&wpCaptchaId=1852528679'
			},
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {
			edit: {
				result: 'Failure',
				captcha: captcha
			}
		} ) );

		gateway.getContent();
		gateway.setContent( 'section 1' );

		gateway.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( {
			type: 'captcha',
			details: captcha
		} ), 'call fail' );
		assert.ok( !doneSpy.called, 'don\'t call done' );
	} );

	QUnit.test( '#save, AbuseFilter warning', 2, function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {
			edit: {
				code: 'abusefilter-warning-usuwanie-tekstu',
				info: 'Hit AbuseFilter: Usuwanie du\u017cej ilo\u015bci tekstu',
				warning: 'horrible desktop-formatted message',
				result: 'Failure'
			}
		} ) );

		gateway.getContent();
		gateway.setContent( 'section 1' );

		gateway.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( {
			type: 'abusefilter',
			details: {
				type: 'warning',
				message: 'horrible desktop-formatted message'
			}
		} ), 'call fail with type and message' );
		assert.ok( !doneSpy.called, 'don\'t call done' );
	} );

	QUnit.test( '#save, AbuseFilter disallow', 2, function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {
			edit: {
				code: 'abusefilter-disallow',
				info: 'Scary filter',
				warning: 'horrible desktop-formatted message',
				result: 'Failure'
			}
		} ) );

		gateway.getContent();
		gateway.setContent( 'section 1' );

		gateway.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( {
			type: 'abusefilter',
			details: {
				type: 'disallow',
				message: 'horrible desktop-formatted message'
			}
		} ), 'call fail with type and message' );
		assert.ok( !doneSpy.called, 'don\'t call done' );
	} );

	QUnit.test( '#save, AbuseFilter other', 2, function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {
			edit: {
				code: 'abusefilter-something',
				info: 'Scary filter',
				warning: 'horrible desktop-formatted message',
				result: 'Failure'
			}
		} ) );

		gateway.getContent();
		gateway.setContent( 'section 1' );

		gateway.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( {
			type: 'abusefilter',
			details: {
				type: 'other',
				message: 'horrible desktop-formatted message'
			}
		} ), 'call fail with type and message' );
		assert.ok( !doneSpy.called, 'don\'t call done' );
	} );

	QUnit.test( '#save, extension errors', 2, function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {
			edit: {
				code: 'testerror',
				result: 'Failure'
			}
		} ) );

		gateway.getContent();
		gateway.setContent( 'section 1' );

		gateway.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( {
			type: 'error',
			details: 'testerror'
		} ), 'call fail with code' );
		assert.ok( !doneSpy.called, 'don\'t call done' );
	} );

	QUnit.test( '#save, unknown errors', 2, function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {} ) );

		gateway.getContent();
		gateway.setContent( 'section 1' );

		gateway.save().done( doneSpy ).fail( failSpy );

		assert.ok( failSpy.calledWith( {
			type: 'error',
			details: 'unknown'
		} ), 'call fail with unknown' );
		assert.ok( !doneSpy.called, 'don\'t call done' );
	} );

	QUnit.test( '#save, without changes', 2, function ( assert ) {
		var postStub,
			gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} );

		postStub = this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve(
			{
				edit: {
					result: 'Success'
				}
			}
		) );

		gateway.getContent();
		gateway.setContent( 'section' );
		assert.strictEqual( gateway.hasChanged, false, 'hasChanged is false' );
		gateway.save( {
			summary: 'summary'
		} ).done( function () {
			assert.ok( postStub.calledWith( {
				action: 'edit',
				title: 'test',
				section: 1,
				text: 'section',
				summary: 'summary',
				captchaid: undefined,
				captchaword: undefined,
				token: 'fake token',
				basetimestamp: '2013-05-15T00:30:26Z',
				starttimestamp: '2013-05-15T00:30:26Z'
			} ), 'save first section' );
		} );
	} );

	QUnit.test( '#EditorGateway', 2, function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'Test',
				sectionId: 1
			} ),
			postStub,
			doneSpy = this.sandbox.spy();

		postStub = this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {
			parse: {
				title: 'test',
				text: {
					'*': '<h1>Heading 1</h1><h2>Heading 2</h2><p>test content</p>'
				}
			}
		} ) );

		gateway.getPreview( {
			text: 'test content'
		} ).done( doneSpy );

		assert.ok( postStub.calledWithMatch( {
			text: 'test content'
		} ) );
		assert.ok( doneSpy.calledWith( '<h1>Heading 1</h1><h2>Heading 2</h2><p>test content</p>' ) );
	} );

	QUnit.test( '#EditorGateway, check without sectionLine', 1, function ( assert ) {
		var gateway = new EditorGateway( {
			api: new mw.Api(),
			title: 'Test',
			sectionId: 1
		} );
		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {
			parse: {
				title: 'test',
				text: {
					'*': 'test content'
				},
				sections: {}
			}
		} ) );

		gateway.getPreview( {
			text: 'test content'
		} ).done( function ( text, sectionLine ) {
			assert.strictEqual( sectionLine, '', 'Ok, no section line returned' );
		} );
	} );

	QUnit.test( '#EditorGateway, check with sectionLine', 1, function ( assert ) {
		var gateway = new EditorGateway( {
			api: new mw.Api(),
			title: 'Test',
			sectionId: 1
		} );
		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {
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

		gateway.getPreview( {
			text: 'test content'
		} ).done( function ( text, sectionLine ) {
			assert.strictEqual( sectionLine, 'Testsection', 'Ok, section line returned' );
		} );
	} );

	QUnit.test( '#save, when token has expired', 2, function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'MediaWiki:Test.css'
			} );

		this.sandbox.stub( mw.Api.prototype, 'post' )
			.onFirstCall().returns( $.Deferred().reject( 'badtoken' ) )
			.onSecondCall().returns( $.Deferred().resolve( {
				edit: {
					result: 'Success'
				}
			} ) );

		mw.Api.prototype.getToken
			.onFirstCall().returns( $.Deferred().resolve( 'cachedbadtoken' ) )
			.onSecondCall().returns( $.Deferred().resolve( 'goodtoken' ) );

		gateway.getContent();
		gateway.setContent( 'section 1' );
		gateway.save();
		assert.ok( mw.Api.prototype.getToken.calledTwice, 'check the spy was called twice' );
		assert.ok( mw.Api.prototype.post.calledTwice, 'check the spy was called twice' );
	} );

}( mw.mobileFrontend, jQuery ) );
