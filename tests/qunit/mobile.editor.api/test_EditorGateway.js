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

	QUnit.test( '#getContent (no section)', function ( assert ) {
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
			list: 'blocks',
			bkusers: mw.user.getName(),
			bkprop: 'flags',
			formatversion: 2
		} ), 'rvsection not passed to api request' );
	} );

	QUnit.test( '#getContent', function ( assert ) {
		var gateway,
			spy = this.spy;

		gateway = new EditorGateway( {
			api: new mw.Api(),
			title: 'test',
			sectionId: 1
		} );

		return gateway.getContent().done( function ( resp ) {
			assert.strictEqual( resp.text, 'section', 'return section content' );
			return gateway.getContent();
		} ).then( function () {
			assert.ok( spy.calledOnce, 'cache content' );
		} );
	} );

	QUnit.test( '#getContent, new page', function ( assert ) {
		var gateway,
			spy = this.spy;

		gateway = new EditorGateway( {
			api: new mw.Api(),
			title: 'test',
			isNewPage: true
		} );

		return gateway.getContent().done( function ( resp ) {
			assert.strictEqual( resp.text, '', 'return empty section' );
			assert.ok( !spy.called, 'don\'t try to retrieve content using API' );
		} );
	} );

	QUnit.test( '#getContent, missing section', function ( assert ) {
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

	QUnit.test( '#save, success', function ( assert ) {
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

		return gateway.getContent().then( function () {
			gateway.setContent( 'section 1' );
			assert.strictEqual( gateway.hasChanged, true, 'hasChanged is true' );
		} ).then( function () {
			return gateway.save( {
				summary: 'summary'
			} );
		} ).then( function () {
			assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
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
	} );

	QUnit.test( '#save, new page', function ( assert ) {
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
		return gateway.save( {
			summary: 'summary'
		} ).then( function () {
			assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
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
	} );

	QUnit.test( '#save, after #setPrependText', function ( assert ) {
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
		return gateway.save( {
			summary: 'summary'
		} ).then( function () {
			assert.strictEqual( gateway.hasChanged, false, 'reset hasChanged' );
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
	} );

	QUnit.test( '#save, submit CAPTCHA', function ( assert ) {
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
	} );

	QUnit.test( '#save, request failure', function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy(),
			done = $.Deferred();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().reject() );

		gateway.getContent().then( function () {
			gateway.setContent( 'section 1' );
			return gateway.save();
		} ).done( doneSpy ).fail( failSpy ).always( function () {
			assert.ok( failSpy.calledWith( {
				type: 'error',
				details: 'http'
			} ), 'call fail' );
			assert.ok( !doneSpy.called, 'don\'t call done' );
			done.resolve();
		} );
		return done;
	} );

	QUnit.test( '#save, API failure', function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy(),
			done = $.Deferred();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve(
			{
				error: {
					code: 'error code'
				}
			}
		) );

		gateway.getContent().done( function () {
			gateway.setContent( 'section 1' );
			gateway.save().done( doneSpy ).fail( failSpy ).always( function () {
				assert.ok( failSpy.calledWith( {
					type: 'error',
					details: 'error code'
				} ), 'call fail' );
				assert.ok( !doneSpy.called, 'don\'t call done' );
				done.resolve();
			} );
		} );

		return done;
	} );

	QUnit.test( '#save, CAPTCHA response with image URL', function ( assert ) {
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
			failSpy = this.sandbox.spy(),
			done = $.Deferred();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {
			edit: {
				result: 'Failure',
				captcha: captcha
			}
		} ) );

		gateway.getContent();
		gateway.setContent( 'section 1' );
		gateway.save().done( doneSpy ).fail( failSpy ).always( function () {
			assert.ok( failSpy.calledWith( {
				type: 'captcha',
				details: captcha
			} ), 'call fail' );
			assert.ok( !doneSpy.called, 'don\'t call done' );
			done.resolve();
		} );
		return done;
	} );

	QUnit.test( '#save, AbuseFilter warning', function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy(),
			done = $.Deferred();

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
		gateway.save().done( doneSpy ).fail( failSpy ).always( function () {
			assert.ok( failSpy.calledWith( {
				type: 'abusefilter',
				details: {
					type: 'warning',
					message: 'horrible desktop-formatted message'
				}
			} ), 'call fail with type and message' );
			assert.ok( !doneSpy.called, 'don\'t call done' );
			done.resolve();
		} );
		return done;
	} );

	QUnit.test( '#save, AbuseFilter disallow', function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy(),
			done = $.Deferred();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {
			edit: {
				code: 'abusefilter-disallow',
				info: 'Scary filter',
				warning: 'horrible desktop-formatted message',
				result: 'Failure'
			}
		} ) );

		gateway.getContent().then( function () {
			return gateway.setContent( 'section 1' );
		} ).then( function () {
			gateway.save().done( doneSpy ).fail( failSpy ).always( function () {
				assert.ok( failSpy.calledWith( {
					type: 'abusefilter',
					details: {
						type: 'disallow',
						message: 'horrible desktop-formatted message'
					}
				} ), 'call fail with type and message' );
				assert.ok( !doneSpy.called, 'don\'t call done' );
				done.resolve();
			} );
		} );

		return done;
	} );

	QUnit.test( '#save, AbuseFilter other', function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy(),
			done = $.Deferred();

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
		gateway.save().done( doneSpy ).fail( failSpy ).always( function () {
			assert.ok( failSpy.calledWith( {
				type: 'abusefilter',
				details: {
					type: 'other',
					message: 'horrible desktop-formatted message'
				}
			} ), 'call fail with type and message' );
			assert.ok( !doneSpy.called, 'don\'t call done' );
			done.resolve();
		} );
		return done;
	} );

	QUnit.test( '#save, extension errors', function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			failSpy = this.sandbox.spy(),
			done = $.Deferred();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {
			edit: {
				code: 'testerror',
				result: 'Failure'
			}
		} ) );

		gateway.getContent().then( function () {
			return gateway.setContent( 'section 1' );
		} ).then( function () {
			gateway.save().done( doneSpy ).fail( failSpy ).always( function () {
				assert.ok( failSpy.calledWith( {
					type: 'error',
					details: 'testerror'
				} ), 'call fail with code' );
				assert.ok( !doneSpy.called, 'don\'t call done' );
				done.resolve();
			} );
		} );

		return done;
	} );

	QUnit.test( '#save, unknown errors', function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'test',
				sectionId: 1
			} ),
			doneSpy = this.sandbox.spy(),
			done = $.Deferred(),
			failSpy = this.sandbox.spy();

		this.sandbox.stub( mw.Api.prototype, 'post' ).returns( $.Deferred().resolve( {} ) );

		gateway.getContent();
		gateway.setContent( 'section 1' );

		gateway.save().done( doneSpy ).fail( failSpy ).always( function () {
			assert.ok( failSpy.calledWith( {
				type: 'error',
				details: 'unknown'
			} ), 'call fail with unknown' );
			assert.ok( !doneSpy.called, 'don\'t call done' );
			done.resolve();
		} );
		return done;
	} );

	QUnit.test( '#save, without changes', function ( assert ) {
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

		return gateway.getContent().then( function () {
			return gateway.setContent( 'section' );
		} ).then( function () {
			assert.strictEqual( gateway.hasChanged, false, 'hasChanged is false' );
			return gateway.save( {
				summary: 'summary'
			} );
		} ).then( function () {
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

	QUnit.test( '#EditorGateway', function ( assert ) {
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
		assert.ok( doneSpy.calledWith( {
			line: '',
			text: '<h1>Heading 1</h1><h2>Heading 2</h2><p>test content</p>'
		} ) );
	} );

	QUnit.test( '#EditorGateway, check without sectionLine', function ( assert ) {
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

		return gateway.getPreview( {
			text: 'test content'
		} ).done( function ( section ) {
			assert.strictEqual( section.line, '', 'Ok, no section line returned' );
		} );
	} );

	QUnit.test( '#EditorGateway, check with sectionLine', function ( assert ) {
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

		return gateway.getPreview( {
			text: 'test content'
		} ).done( function ( section ) {
			assert.strictEqual( section.line, 'Testsection', 'Ok, section line returned' );
		} );
	} );

	QUnit.test( '#save, when token has expired', function ( assert ) {
		var gateway = new EditorGateway( {
				api: new mw.Api(),
				title: 'MediaWiki:Test.css'
			} ),
			done = $.Deferred();

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
		gateway.save().always( function () {
			assert.ok( mw.Api.prototype.getToken.calledTwice, 'check the spy was called twice' );
			assert.ok( mw.Api.prototype.post.calledTwice, 'check the spy was called twice' );
			done.resolve();
		} );
		return done;
	} );

}( mw.mobileFrontend, jQuery ) );
