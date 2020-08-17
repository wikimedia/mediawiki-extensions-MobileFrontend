const
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	sinon = require( 'sinon' );
let
	util,
	sandbox;

QUnit.module( 'MobileFrontend mobile.languages.structured/util.test.js', {
	beforeEach: function () {
		this.apiLanguages = [
			{
				lang: 'ar',
				url: 'https://ar.wikipedia.org/wiki/%D8%A8%D8%A7%D8%B1%D8%A7%D9%83_%D8%A3%D9%88%D8%A8%D8%A7%D9%85%D8%A7',
				title: 'باراك أوباما',
				dir: 'rtl',
				autonym: 'العربية'
			}, {
				lang: 'be',
				url: 'https://be.wikipedia.org/wiki/%D0%91%D0%B0%D1%80%D0%B0%D0%BA_%D0%90%D0%B1%D0%B0%D0%BC%D0%B0',
				title: 'Барак Абама',
				dir: 'ltr',
				autonym: 'беларуская'
			}, {
				lang: 'be-x-old',
				url: 'https://be-x-old.wikipedia.org/wiki/%D0%91%D0%B0%D1%80%D0%B0%D0%BA_%D0%90%D0%B1%D0%B0%D0%BC%D0%B0',
				title: 'Барак Абама',
				autonym: 'беларуская (тарашкевіца)'
			}, {
				lang: 'es',
				url: 'https://en.wikipedia.org/wiki/Barack_Obama',
				title: 'Barack Obama',
				dir: 'ltr',
				autonym: 'Spanish'
			}, {
				lang: 'ko',
				url: 'https://ko.wikipedia.org/wiki/%EB%B2%84%EB%9D%BD_%EC%98%A4%EB%B0%94%EB%A7%88',
				title: '버락 오바마',
				dir: 'ltr',
				autonym: '한국어'
			}, {
				lang: 'ru',
				url: 'https://ru.wikipedia.org/wiki/%D0%9E%D0%B1%D0%B0%D0%BC%D0%B0,_%D0%91%D0%B0%D1%80%D0%B0%D0%BA',
				title: 'Обама, Барак',
				dir: 'ltr',
				autonym: 'русский'
			}, {
				lang: 'uz',
				url: 'https://uz.wikipedia.org/wiki/Barak_Obama',
				title: 'Barak Obama',
				dir: 'ltr',
				autonym: 'oʻzbekcha/ўзбекча'
			}, {
				lang: 'zh',
				url: 'https://zh.wikipedia.org/wiki/%E8%B4%9D%E6%8B%89%E5%85%8B%C2%B7%E5%A5%A5%E5%B7%B4%E9%A9%AC',
				title: '贝拉克·奥巴马',
				dir: 'ltr',
				autonym: '中文'
			}, {
				lang: 'zh-min-nan',
				url: 'https://zh-min-nan.wikipedia.org/wiki/Barack_Obama',
				title: 'Barack Obama',
				dir: 'ltr',
				autonym: 'Bân-lâm-gú'
			}, {
				lang: 'zh-yue',
				url: 'https://zh-yue.wikipedia.org/wiki/%E5%A5%A7%E5%B7%B4%E9%A6%AC',
				title: '奧巴馬',
				dir: 'ltr',
				autonym: '粵語'
			}, {
				lang: 'zu',
				url: 'https://zu.wikipedia.org/wiki/Barack_Obama',
				title: 'Barack Obama',
				dir: 'ltr',
				autonym: 'isiZulu'
			}
		];
		this.apiVariants = [ {
			autonym: '不转换',
			lang: 'zh',
			url: '/~bmansurov/mediawiki/index.php/3?variant=zh'
		}, {
			autonym: '简体',
			lang: 'zh-hans',
			url: '/~bmansurov/mediawiki/index.php/3?variant=zh-hans'
		} ];

		this.deviceLanguage = 'en-us';

		this.frequentlyUsedLanguages = {
			zh: 2,
			ko: 1
		};

		this.structuredLanguages = {
			all: [
				{
					lang: 'zh-min-nan',
					autonym: 'Bân-lâm-gú',
					title: 'Barack Obama',
					dir: 'ltr',
					url: 'https://zh-min-nan.wikipedia.org/wiki/Barack_Obama'
				},
				{
					lang: 'zu',
					autonym: 'isiZulu',
					title: 'Barack Obama',
					dir: 'ltr',
					url: 'https://zu.wikipedia.org/wiki/Barack_Obama'
				},
				{
					lang: 'uz',
					autonym: 'oʻzbekcha/ўзбекча',
					title: 'Barak Obama',
					dir: 'ltr',
					url: 'https://uz.wikipedia.org/wiki/Barak_Obama'
				},
				{
					lang: 'es',
					autonym: 'Spanish',
					title: 'Barack Obama',
					dir: 'ltr',
					url: 'https://en.wikipedia.org/wiki/Barack_Obama'
				},
				{
					lang: 'be',
					autonym: 'беларуская',
					title: 'Барак Абама',
					dir: 'ltr',
					url: 'https://be.wikipedia.org/wiki/%D0%91%D0%B0%D1%80%D0%B0%D0%BA_%D0%90%D0%B1%D0%B0%D0%BC%D0%B0'
				},
				{
					lang: 'be-x-old',
					autonym: 'беларуская (тарашкевіца)',
					title: 'Барак Абама',
					dir: 'ltr',
					url: 'https://be-x-old.wikipedia.org/wiki/%D0%91%D0%B0%D1%80%D0%B0%D0%BA_%D0%90%D0%B1%D0%B0%D0%BC%D0%B0'
				},
				{
					lang: 'ru',
					autonym: 'русский',
					title: 'Обама, Барак',
					dir: 'ltr',
					url: 'https://ru.wikipedia.org/wiki/%D0%9E%D0%B1%D0%B0%D0%BC%D0%B0,_%D0%91%D0%B0%D1%80%D0%B0%D0%BA'
				},
				{
					lang: 'ar',
					autonym: 'العربية',
					title: 'باراك أوباما',
					dir: 'rtl',
					url: 'https://ar.wikipedia.org/wiki/%D8%A8%D8%A7%D8%B1%D8%A7%D9%83_%D8%A3%D9%88%D8%A8%D8%A7%D9%85%D8%A7'
				},
				{
					lang: 'zh-yue',
					autonym: '粵語',
					title: '奧巴馬',
					dir: 'ltr',
					url: 'https://zh-yue.wikipedia.org/wiki/%E5%A5%A7%E5%B7%B4%E9%A6%AC'
				}
			],
			suggested: [
				{
					frequency: 2,
					lang: 'zh',
					autonym: '中文',
					title: '贝拉克·奥巴马',
					dir: 'ltr',
					url: 'https://zh.wikipedia.org/wiki/%E8%B4%9D%E6%8B%89%E5%85%8B%C2%B7%E5%A5%A5%E5%B7%B4%E9%A9%AC'
				},
				{
					frequency: 1,
					lang: 'ko',
					autonym: '한국어',
					title: '버락 오바마',
					dir: 'ltr',
					url: 'https://ko.wikipedia.org/wiki/%EB%B2%84%EB%9D%BD_%EC%98%A4%EB%B0%94%EB%A7%88'
				}
			]
		};

		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		sandbox.stub( mw.storage, 'get' ).withArgs( 'langMap' )
			.returns( JSON.stringify( this.frequentlyUsedLanguages ) );

		util = require( '../../../src/mobile.languages.structured/util' );

		this.saveSpy = sandbox.stub( util, 'saveFrequentlyUsedLanguages' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#getFrequentlyUsedLanguages', function ( assert ) {

	assert.propEqual( util.getFrequentlyUsedLanguages(), this.frequentlyUsedLanguages,
		'Frequently used languages is correct.' );
} );

QUnit.test( '#saveLanguageUsageCount', function ( assert ) {
	util.saveLanguageUsageCount( 'ko', util.getFrequentlyUsedLanguages() );
	assert.ok( this.saveSpy.calledWith( {
		zh: 2,
		ko: 2
	} ), 'Frequently used language is correctly saved.' );
} );

QUnit.test( '#getStructuredLanguages', function ( assert ) {
	const result = util.getStructuredLanguages(
		this.apiLanguages, false, this.frequentlyUsedLanguages, true, this.deviceLanguage
	);

	assert.propEqual(
		result,
		this.structuredLanguages,
		'Structured languages are correct, including sort order.'
	);
} );

QUnit.test( '#getStructuredLanguages device language', function ( assert ) {
	const result =
		util.getStructuredLanguages( this.apiLanguages, false, {}, true, 'es-lx' ).suggested[0].lang;

	// device language is a variant and only the parent language is available
	assert.strictEqual(
		result,
		'es',
		'"es" is correctly selected as a suggested language even though the device language is "es-lx".'
	);
} );

QUnit.test( '#getStructuredLanguages variants', function ( assert ) {
	const variantsMap = {};

	const suggestedLanguages = util.getStructuredLanguages(
		this.apiLanguages, this.apiVariants, {}, true, this.deviceLanguage
	).suggested;
	this.apiVariants.forEach( function ( variant ) {
		variantsMap[ variant.lang ] = variant;
	} );
	suggestedLanguages.forEach( function ( suggestedLanguage ) {
		assert.ok(
			Object.prototype.hasOwnProperty.call( variantsMap, suggestedLanguage.lang ),
			'Variant "' + suggestedLanguage.lang + '" is in the list of suggested languages.'
		);
	} );
} );
