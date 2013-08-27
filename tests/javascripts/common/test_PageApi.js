( function( M, $ ) {
	var PageApi = M.require( 'PageApi' ), pageApi;

	QUnit.module( 'MobileFrontend PageApi', {
		setup: function() {
			pageApi = new PageApi();
		}
	} );

	QUnit.test( '#getPageUrl, with parameters', 2, function( assert ) {
		sinon.stub( mw.config, 'get' ).withArgs( 'wgArticlePath' ).returns( '/w/index.php/$1' );
		assert.strictEqual( pageApi.getPageUrl( 'Foo', {} ), '/w/index.php/Foo' );
		assert.strictEqual( pageApi.getPageUrl( 'Foo', { action: 'edit' } ), '/w/index.php/Foo?action=edit' );
		mw.config.get.restore();
	} );

	QUnit.test( '#getPage', 2, function( assert ) {
		sinon.stub( PageApi.prototype, 'get' ).returns( $.Deferred().resolve( {
			"mobileview": {
				"sections": [
					{ "id": 0, "text": "lead content" },
					{
						"level": "2",
						"line": "Aaa section",
						"anchor": "Aaa_section",
						"id": 1,
						"text": "aaa content"
					},
					{
						"level": "3",
						"line": "Subaaa section",
						"anchor": "Subaaa_section",
						"id": 2,
						"text": "subaaa content"
					},
					{
						"level": "2",
						"line": "Bbb section",
						"anchor": "Bbb_section",
						"id": 3,
						"text": "bbb content"
					},
					{
						"level": "2",
						"line": "References",
						"references": "",
						"anchor": "References",
						"id": 4,
						"text": "references"
					}
				]
			}
		} ) );

		pageApi.getPage( 'Test' ).done( function( resp ) {
			assert.deepEqual( resp, {
				title: 'Test',
				id: -1,
				isMainPage: false,
				lead: 'lead content',
				sections: [
					{
						"level": "2",
						"line": "Aaa section",
						"anchor": "Aaa_section",
						"id": 1,
						"text": 'aaa content<h3 id="Subaaa_section">Subaaa section</h3>subaaa content'
					},
					{
						"level": "2",
						"line": "Bbb section",
						"anchor": "Bbb_section",
						"id": 3,
						"text": "bbb content"
					},
					{
						"level": "2",
						"line": "References",
						"references": "",
						"anchor": "References",
						"id": 4,
						"text": "references"
					}
				]
			}, 'return lead and sections' );
		} );
		pageApi.getPage( 'Test' );
		assert.ok( pageApi.get.calledOnce, 'cache page' );

		PageApi.prototype.get.restore();
	} );

	QUnit.test( '#_getAllLanguages', 2, function( assert ) {
		sinon.stub( PageApi.prototype, 'get' ).returns( $.Deferred().resolve( {
			"query":{
				"languages":[
					{
						"code":"en",
						"*":"English"
					},
					{
						"code":"es",
						"*":"espa\u00f1ol"
					},
					{
						"code":"pl",
						"*":"polski"
					},
					{
						"code":"sr",
						"*":"\u0441\u0440\u043f\u0441\u043a\u0438 / srpski"
					}
				]
			}
		} ) );

		pageApi._getAllLanguages().done( function( resp ) {
			assert.deepEqual( resp, {
				en: "English",
				es: "espa\u00f1ol",
				pl: "polski",
				sr: "\u0441\u0440\u043f\u0441\u043a\u0438 / srpski"
			}, 'return languages object' );
		} );
		pageApi._getAllLanguages();
		assert.ok( pageApi.get.calledOnce, 'cache languages' );

		PageApi.prototype.get.restore();
	} );

	QUnit.test( '#getPageLanguages', 1, function( assert ) {
		sinon.stub( PageApi.prototype, 'get' ).returns( $.Deferred().resolve( {
			"query":{
				"pages":{
					"94":{
						"pageid":94,
						"ns":0,
						"title":"San Francisco",
						"langlinks":[
							{
								"lang":"es",
								"url":"http://es.wikipedia.org/wiki/San_Francisco_(California)",
								"*":"San Francisco (California)"
							},
							{
								"lang":"pl",
								"url":"http://pl.wikipedia.org/wiki/San_Francisco",
								"*":"San Francisco"
							},
							{
								"lang":"sr",
								"url":"http://sr.wikipedia.org/wiki/%D0%A1%D0%B0%D0%BD_%D0%A4%D1%80%D0%B0%D0%BD%D1%86%D0%B8%D1%81%D0%BA%D0%BE",
								"*":"\u0421\u0430\u043d \u0424\u0440\u0430\u043d\u0446\u0438\u0441\u043a\u043e"
							}
						]
					}
				}
			},
			"limits":{
				"langlinks":500
			}
		} ) );

		sinon.stub( pageApi, '_getAllLanguages' ).returns( $.Deferred().resolve( {
			en: "English",
			es: "espa\u00f1ol",
			pl: "polski",
			sr: "\u0441\u0440\u043f\u0441\u043a\u0438 / srpski"
		} ) );

		pageApi.getPageLanguages( 'Test' ).done( function( resp ) {
			assert.deepEqual( resp, [
				{
					"lang":"es",
					"url":"http://es.wikipedia.org/wiki/San_Francisco_(California)",
					"*":"San Francisco (California)",
					langname: "espa\u00f1ol"
				},
				{
					"lang":"pl",
					"url":"http://pl.wikipedia.org/wiki/San_Francisco",
					"*":"San Francisco",
					langname: "polski"
				},
				{
					"lang":"sr",
					"url":"http://sr.wikipedia.org/wiki/%D0%A1%D0%B0%D0%BD_%D0%A4%D1%80%D0%B0%D0%BD%D1%86%D0%B8%D1%81%D0%BA%D0%BE",
					"*":"\u0421\u0430\u043d \u0424\u0440\u0430\u043d\u0446\u0438\u0441\u043a\u043e",
					langname: "\u0441\u0440\u043f\u0441\u043a\u0438 / srpski"
				}
			], 'return augmented language links' );
		} );

		PageApi.prototype.get.restore();
		pageApi._getAllLanguages.restore();
	} );

}( mw.mobileFrontend, jQuery ) );
