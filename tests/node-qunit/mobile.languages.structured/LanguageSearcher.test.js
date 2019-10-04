let
	LanguageSearcher,
	sandbox;
const
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' ),
	apiLanguages = [
		{
			lang: 'ar',
			url: 'https://ar.wikipedia.org/wiki/%D8%A8%D8%A7%D8%B1%D8%A7%D9%83_%D8%A3%D9%88%D8%A8%D8%A7%D9%85%D8%A7',
			title: 'باراك أوباما',
			autonym: 'العربية'
		}, {
			lang: 'be',
			url: 'https://be.wikipedia.org/wiki/%D0%91%D0%B0%D1%80%D0%B0%D0%BA_%D0%90%D0%B1%D0%B0%D0%BC%D0%B0',
			title: 'Барак Абама',
			autonym: 'беларуская'
		}, {
			lang: 'be-x-old',
			url: 'https://be-x-old.wikipedia.org/wiki/%D0%91%D0%B0%D1%80%D0%B0%D0%BA_%D0%90%D0%B1%D0%B0%D0%BC%D0%B0',
			title: 'Барак Абама',
			autonym: 'беларуская (тарашкевіца)'
		}, {
			lang: 'ko',
			url: 'https://ko.wikipedia.org/wiki/%EB%B2%84%EB%9D%BD_%EC%98%A4%EB%B0%94%EB%A7%88',
			title: '버락 오바마',
			autonym: '한국어'
		}, {
			lang: 'ru',
			url: 'https://ru.wikipedia.org/wiki/%D0%9E%D0%B1%D0%B0%D0%BC%D0%B0,_%D0%91%D0%B0%D1%80%D0%B0%D0%BA',
			title: 'Обама, Барак',
			autonym: 'русский'
		}, {
			lang: 'uz',
			url: 'https://uz.wikipedia.org/wiki/Barak_Obama',
			title: 'Barak Obama',
			autonym: 'oʻzbekcha/ўзбекча'
		}, {
			lang: 'zh',
			url: 'https://zh.wikipedia.org/wiki/%E8%B4%9D%E6%8B%89%E5%85%8B%C2%B7%E5%A5%A5%E5%B7%B4%E9%A9%AC',
			title: '贝拉克·奥巴马',
			autonym: '中文'
		}, {
			lang: 'zh-min-nan',
			url: 'https://zh-min-nan.wikipedia.org/wiki/Barack_Obama',
			title: 'Barack Obama',
			langname: 'Chinese',
			autonym: 'Bân-lâm-gú'
		}, {
			lang: 'zh-yue',
			url: 'https://zh-yue.wikipedia.org/wiki/%E5%A5%A7%E5%B7%B4%E9%A6%AC',
			title: '奧巴馬',
			autonym: '粵語'
		}, {
			lang: 'zu',
			url: 'https://zu.wikipedia.org/wiki/Barack_Obama',
			title: 'Barack Obama',
			autonym: 'isiZulu'
		}
	],
	deviceLanguage = 'en-us',
	variants = [
		{
			lang: 'foo',
			url: '/w/index.php?title=Barack_Obama&variant=foo',
			autonym: 'Foo'
		},
		{
			lang: 'foo-x-piglatin',
			url: '/w/index.php?title=Barack_Obama&variant=foo-x-piglatin',
			autonym: 'Igpay Atinlay'
		}
	],
	frequentlyUsedLanguages = {
		'zh-min-nan': 1,
		zh: 2,
		en: 10,
		ko: 1
	};

function enterText( searcher, text ) {
	searcher.$el.find( 'input[type=search]' ).val( text ).trigger( 'input' );
}

QUnit.module( 'MobileFrontend LanguageSearcher.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		LanguageSearcher = require( '../../../src/mobile.languages.structured/LanguageSearcher' );

		sandbox.stub( mw.storage, 'get' ).withArgs( 'langMap' )
			.returns( JSON.stringify( frequentlyUsedLanguages ) );

		this.languageSearcher = new LanguageSearcher( {
			languages: apiLanguages,
			variants: variants,
			deviceLanguage: deviceLanguage
		} );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'renders output', function ( assert ) {
	assert.strictEqual(
		this.languageSearcher.$el.find( '.site-link-list.suggested-languages a' ).length,
		5,
		'There are 5 suggested languages including variants.'
	);

	assert.strictEqual(
		this.languageSearcher.$el.find( '.site-link-list.all-languages a' ).length,
		7,
		'Seven languages are non-suggested.'
	);
} );

QUnit.test( 'saves the language count when link is clicked', function ( assert ) {
	const stub = sandbox.stub( mw.storage, 'set' );

	this.languageSearcher.$el.find( '[lang=foo-x-piglatin]' ).trigger( 'click' );

	assert.strictEqual( stub.callCount, 1, 'mw.storage.set is called once' );
	assert.deepEqual(
		stub.getCall( 0 ).args,
		[ 'langMap', '{"zh-min-nan":1,"zh":2,"en":10,"ko":1,"foo-x-piglatin":1}' ],
		'mw.storage.set is called with correct args'
	);
} );

QUnit.test( 'without variants, input event filters languages', function ( assert ) {
	const languageSearcher = new LanguageSearcher( {
		languages: apiLanguages,
		variants: false,
		deviceLanguage: deviceLanguage
	} );

	enterText( languageSearcher, '' );
	assert.strictEqual(
		languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).length,
		10,
		'The search filter has been cleared. All 10 languages (including variants) are visible.'
	);

	enterText( languageSearcher, 'abcdefghij' );
	assert.strictEqual(
		languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).length,
		0,
		'No languages match "abcdefghij"'
	);

	enterText( languageSearcher, 'chin' );
	assert.ok(
		languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).length === 1 &&
		languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).hasClass( 'zh-min-nan' ),
		'One language (zh-min-nan) matches "Chin" (langname) and only that language is visible.'
	);
} );

QUnit.test( 'with variants, input event filters languages', function ( assert ) {
	enterText( this.languageSearcher, '' );
	assert.strictEqual(
		this.languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).length,
		12,
		'The search filter has been cleared. All 12 languages (including variants) are visible.'
	);

	enterText( this.languageSearcher, 'abcdefghij' );
	assert.strictEqual(
		this.languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).length,
		0,
		'No languages match "abcdefghij"'
	);

	enterText( this.languageSearcher, 'zh' );
	assert.strictEqual(
		this.languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).length,
		3,
		'Three languages match "zh" and only those languages are visible.'
	);

	enterText( this.languageSearcher, 'ol' );
	assert.ok(
		this.languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).length === 1 &&
		this.languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).hasClass( 'be-x-old' ),
		'One language (be-x-old) matches "ol" and only that language is visible.'
	);

	enterText( this.languageSearcher, 'chin' );
	assert.ok(
		this.languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).length === 1 &&
		this.languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).hasClass( 'zh-min-nan' ),
		'One language (zh-min-nan) matches "Chin" (langname) and only that language is visible.'
	);

	enterText( this.languageSearcher, 'ўз' );
	assert.strictEqual(
		this.languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).length,
		1,
		'One language matches "ўз" and only that language is visible.'
	);

	enterText( this.languageSearcher, 'foo' );
	assert.strictEqual(
		this.languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).length,
		2,
		'Two languages match "foo" and only those languages are visible.'
	);

	enterText( this.languageSearcher, 'igpay' );
	assert.strictEqual(
		this.languageSearcher.$el.find( '.site-link-list a:not(.hidden)' ).length,
		1,
		'One language matches "igpay" and only that language is visible.'
	);
} );
