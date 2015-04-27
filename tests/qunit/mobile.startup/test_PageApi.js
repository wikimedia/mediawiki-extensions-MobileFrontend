( function ( M, $ ) {
	var PageApi = M.require( 'PageApi' ),
		pageApi;

	QUnit.module( 'MobileFrontend PageApi', {
		setup: function () {
			pageApi = new PageApi();
		}
	} );

	QUnit.test( '#getPage (h1s)', 1, function ( assert ) {
		this.sandbox.stub( PageApi.prototype, 'get' ).returns( $.Deferred().resolve( {
			mobileview: {
				id: -1,
				displaytitle: 'Test',
				revId: 42,
				lastmodifiedby: {
					name: 'bob',
					gender: 'unknown'
				},
				protection: [],
				lastmodified: '2013-10-28T18:49:56Z',
				languagecount: 10,
				sections: [
					{
						id: 0,
						text: ''
					},
					{
						level: '1',
						line: '1',
						anchor: '1',
						id: 1,
						text: '<p>Text of 1\n</p>'
					},
					{
						level: '2',
						line: '<i>1.1</i>',
						anchor: '1.1',
						id: 2,
						text: '<p>Text of 1.1\n</p>'
					},
					{
						level: '1',
						line: '2',
						anchor: '2',
						id: 3,
						text: '<p>Text of 2\n</p>'
					},
					{
						level: '2',
						line: '2.1',
						anchor: '2.1',
						id: 4,
						text: '<p>Text of 2.1\n</p>'
					} ]
			}
		} ) );

		pageApi.getPage( 'Test' ).done( function ( resp ) {
			assert.deepEqual( resp, {
				historyUrl: mw.util.getUrl( 'Test', {
					action: 'history'
				} ),
				lastModifiedUserName: 'bob',
				lastModifiedUserGender: 'unknown',
				lastModifiedTimestamp: 1382986196,
				title: 'Test',
				revId: 42,
				displayTitle: 'Test',
				id: -1,
				protection: {
					edit: [ '*' ]
				},
				isMainPage: false,
				languageCount: 10,
				hasVariants: false,
				lead: '',
				sections: [
					{
						level: '1',
						line: '1',
						anchor: '1',
						id: 1,
						text: '<p>Text of 1\n</p><h2 id="1.1"><i>1.1</i></h2>\n<p>Text of 1.1\n</p>\n',
						children: [
							{
								level: '2',
								line: '<i>1.1</i>',
								anchor: '1.1',
								id: 2,
								text: '<p>Text of 1.1\n</p>',
								children: []
							}
						]
					},
					{
						level: '1',
						line: '2',
						anchor: '2',
						id: 3,
						text: '<p>Text of 2\n</p><h2 id="2.1">2.1</h2>\n<p>Text of 2.1\n</p>\n',
						children: [
							{
								level: '2',
								line: '2.1',
								anchor: '2.1',
								id: 4,
								text: '<p>Text of 2.1\n</p>',
								children: []
							}
						]
					}
				]
			}, 'return lead and sections test 1' );
		} );
		PageApi.prototype.get.restore();
	} );

	QUnit.test( '#getPage', 2, function ( assert ) {
		this.sandbox.stub( PageApi.prototype, 'get' ).returns( $.Deferred().resolve( {
			mobileview: {
				id: -1,
				protection: {
					edit: [ 'sysop' ]
				},
				lastmodifiedby: {
					name: 'Melissa',
					gender: 'female'
				},
				revId: 42,
				displaytitle: 'Test',
				lastmodified: '2013-10-28T18:49:56Z',
				languagecount: 10,
				sections: [
					{
						id: 0,
						text: 'lead content'
					},
					{
						level: '2',
						line: 'Aaa section',
						anchor: 'Aaa_section',
						id: 1,
						text: 'aaa content'
					},
					{
						level: '3',
						line: 'Subaaa section',
						anchor: 'Subaaa_section',
						id: 2,
						text: 'subaaa content'
					},
					{
						level: '2',
						line: 'Bbb section',
						anchor: 'Bbb_section',
						id: 3,
						text: 'bbb content'
					},
					{
						level: '2',
						line: 'References',
						references: '',
						anchor: 'References',
						id: 4,
						text: 'references'
					}
				]
			}
		} ) );

		pageApi.getPage( 'Test' ).done( function ( resp ) {
			assert.deepEqual( resp, {
				historyUrl: mw.util.getUrl( 'Test', {
					action: 'history'
				} ),
				lastModifiedUserName: 'Melissa',
				lastModifiedUserGender: 'female',
				lastModifiedTimestamp: 1382986196,
				protection: {
					edit: [ 'sysop' ]
				},
				title: 'Test',
				displayTitle: 'Test',
				id: -1,
				isMainPage: false,
				revId: 42,
				languageCount: 10,
				hasVariants: false,
				lead: 'lead content',
				sections: [
					{
						level: '2',
						line: 'Aaa section',
						anchor: 'Aaa_section',
						id: 1,
						text: 'aaa content<h3 id="Subaaa_section">Subaaa section</h3>\nsubaaa content\n',
						children: [
							{
								level: '3',
								line: 'Subaaa section',
								anchor: 'Subaaa_section',
								id: 2,
								text: 'subaaa content',
								children: []
							}
						]
					},
					{
						level: '2',
						line: 'Bbb section',
						anchor: 'Bbb_section',
						id: 3,
						text: 'bbb content',
						children: []
					},
					{
						level: '2',
						line: 'References',
						references: '',
						anchor: 'References',
						id: 4,
						text: 'references',
						children: []
					}
				]
			}, 'return lead and sections test 2' );
		} );
		pageApi.getPage( 'Test' );
		assert.ok( pageApi.get.calledOnce, 'cache page' );

		PageApi.prototype.get.restore();
	} );

	QUnit.test( '#getPageLanguages', 2, function ( assert ) {
		this.sandbox.stub( PageApi.prototype, 'get' ).returns( $.Deferred().resolve( {
			query: {
				pages: {
					94: {
						pageid: 94,
						ns: 0,
						title: 'San Francisco',
						langlinks: [
							{
								lang: 'es',
								url: 'http://es.wikipedia.org/wiki/San_Francisco_(California)',
								'*': 'San Francisco (California)'
							},
							{
								lang: 'pl',
								url: 'http://pl.wikipedia.org/wiki/San_Francisco',
								'*': 'San Francisco'
							},
							{
								lang: 'sr',
								url: 'http://sr.wikipedia.org/wiki/%D0%A1%D0%B0%D0%BD_%D0%A4%D1%80%D0%B0%D0%BD%D1%86%D0%B8%D1%81%D0%BA%D0%BE',
								'*': '\u0421\u0430\u043d \u0424\u0440\u0430\u043d\u0446\u0438\u0441\u043a\u043e'
							}
						]
					}
				},
				general: {
					variants: [
						{
							code: 'sr',
							name: 'sr'
						},
						{
							code: 'sr-ec',
							name: '\u040b\u0438\u0440\u0438\u043b\u0438\u0446\u0430'
						},
						{
							code: 'sr-el',
							name: 'Latinica'
						}
					],
					variantarticlepath: '/$2/$1'
				},
				languages: [
					{
						code: 'sr',
						'*': '\u0441\u0440\u043f\u0441\u043a\u0438 / srpski'
					},
					{
						code: 'sr-ec',
						'*': '\u0441\u0440\u043f\u0441\u043a\u0438 (\u045b\u0438\u0440\u0438\u043b\u0438\u0446\u0430)\u200e'
					},
					{
						code: 'sr-el',
						'*': 'srpski (latinica)\u200e'
					},
					{
						code: 'es',
						'*': 'espa\u00f1ol'
					},
					{
						code: 'pl',
						'*': 'polski'
					}
				]
			},
			limits: {
				langlinks: 500
			}
		} ) );

		pageApi.getPageLanguages( 'Test' ).done( function ( resp ) {
			assert.deepEqual( resp.languages, [
				{
					lang: 'es',
					url: 'http://es.wikipedia.org/wiki/San_Francisco_(California)',
					'*': 'San Francisco (California)',
					title: 'San Francisco (California)',
					langname: 'espa\u00f1ol'
				},
				{
					lang: 'pl',
					url: 'http://pl.wikipedia.org/wiki/San_Francisco',
					'*': 'San Francisco',
					title: 'San Francisco',
					langname: 'polski'
				},
				{
					lang: 'sr',
					url: 'http://sr.wikipedia.org/wiki/%D0%A1%D0%B0%D0%BD_%D0%A4%D1%80%D0%B0%D0%BD%D1%86%D0%B8%D1%81%D0%BA%D0%BE',
					'*': '\u0421\u0430\u043d \u0424\u0440\u0430\u043d\u0446\u0438\u0441\u043a\u043e',
					title: '\u0421\u0430\u043d \u0424\u0440\u0430\u043d\u0446\u0438\u0441\u043a\u043e',
					langname: '\u0441\u0440\u043f\u0441\u043a\u0438 / srpski'
				}
			], 'return augmented language links' );

			assert.deepEqual( resp.variants, [
				{
					lang: 'sr',
					langname: 'sr',
					url: '/sr/Test'
				},
				{
					lang: 'sr-ec',
					langname: '\u040b\u0438\u0440\u0438\u043b\u0438\u0446\u0430',
					url: '/sr-ec/Test'
				},
				{
					lang: 'sr-el',
					langname: 'Latinica',
					url: '/sr-el/Test'
				}
			], 'return augmented language variant links' );
		} );

		PageApi.prototype.get.restore();
	} );

	QUnit.test( '#_getAPIResponseFromHTML', 1, function ( assert ) {
		var resp = pageApi._getAPIResponseFromHTML( $( '<div><h1><span id="1.0">A1</span></h1><h2><span>A2.1</span></h2><h2><span>A2.2</span></h2><h1><span>A2</span></h1><h2><span>A2.1</span></h2></div>' ) );
		assert.deepEqual( resp, [
			{
				line: 'A1',
				level: '1',
				anchor: '1.0',
				text: ''
			},
			{
				line: 'A2.1',
				level: '2',
				anchor: '',
				text: ''
			},
			{
				line: 'A2.2',
				level: '2',
				anchor: '',
				text: ''
			},
			{
				line: 'A2',
				level: '1',
				anchor: '',
				text: ''
			},
			{
				line: 'A2.1',
				level: '2',
				anchor: '',
				text: ''
			}
		] );
	} );

	QUnit.test( '#getSectionsFromHTML malformed (h2 before h1)', 1, function ( assert ) {
		var resp = pageApi.getSectionsFromHTML(
			$( '<div><h2><span id="1.0">A1</span></h2><h3><span>A2.1</span></h3><h2><span>A2.2</span></h2><h1><span>A2</span></h1><h2><span>A2.1</span></h2></div>' ) );
		assert.deepEqual( resp, [
			{
				line: 'A1',
				level: '2',
				anchor: '1.0',
				text: '<h3 id="">A2.1</h3>\n\n',
				children: [ {
					line: 'A2.1',
					level: '3',
					anchor: '',
					text: '',
					children: []
				} ]
			},
			{
				line: 'A2.2',
				level: '2',
				anchor: '',
				text: '',
				children: []
			},
			{
				line: 'A2',
				level: '1',
				anchor: '',
				text: '<h2 id="">A2.1</h2>\n\n',
				children: [ {
					line: 'A2.1',
					level: '2',
					anchor: '',
					text: '',
					children: []
				} ]
			}
		] );
	} );

	QUnit.test( '#getPage (move protected page)', 1, function ( assert ) {
		var expected = {
			edit: [ '*' ],
			move: [ 'sysop' ]
		};
		this.sandbox.stub( PageApi.prototype, 'get' ).returns( $.Deferred().resolve( {
			mobileview: {
				id: -1,
				displaytitle: 'Test',
				revId: 42,
				lastmodifiedby: {
					name: 'bob',
					gender: 'unknown'
				},
				protection: {
					move: [ 'sysop' ]
				},
				lastmodified: '2013-10-28T18:49:56Z',
				languagecount: 10,
				sections: [
					{
						id: 0,
						text: ''
					}
				]
			}
		} ) );

		pageApi.getPage( 'Test' ).done( function ( resp ) {
			assert.deepEqual( resp.protection, expected );
		} );
	} );

}( mw.mobileFrontend, jQuery ) );
