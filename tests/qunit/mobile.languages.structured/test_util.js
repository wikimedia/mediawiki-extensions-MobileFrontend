( function ( M ) {
	var util = M.require( 'mobile.languages.structured/util' );

	QUnit.module( 'MobileFrontend: Structured LanguageOverlay', {
		setup: function () {
			if ( mw.eventLog ) {
				this.sandbox.stub( mw.eventLog.Schema.prototype, 'log' );
			}

			this.apiLanguages = [
				{
					lang: 'ar',
					url: 'https://ar.wikipedia.org/wiki/%D8%A8%D8%A7%D8%B1%D8%A7%D9%83_%D8%A3%D9%88%D8%A8%D8%A7%D9%85%D8%A7',
					title: 'باراك أوباما',
					langname: 'العربية'
				}, {
					lang: 'be',
					url: 'https://be.wikipedia.org/wiki/%D0%91%D0%B0%D1%80%D0%B0%D0%BA_%D0%90%D0%B1%D0%B0%D0%BC%D0%B0',
					title: 'Барак Абама',
					langname: 'беларуская'
				}, {
					lang: 'be-x-old',
					url: 'https://be-x-old.wikipedia.org/wiki/%D0%91%D0%B0%D1%80%D0%B0%D0%BA_%D0%90%D0%B1%D0%B0%D0%BC%D0%B0',
					title: 'Барак Абама',
					langname: 'беларуская (тарашкевіца)'
				}, {
					lang: 'es',
					url: 'https://en.wikipedia.org/wiki/Barack_Obama',
					title: 'Barack Obama',
					langname: 'Spanish'
				}, {
					lang: 'ko',
					url: 'https://ko.wikipedia.org/wiki/%EB%B2%84%EB%9D%BD_%EC%98%A4%EB%B0%94%EB%A7%88',
					title: '버락 오바마',
					langname: '한국어'
				}, {
					lang: 'ru',
					url: 'https://ru.wikipedia.org/wiki/%D0%9E%D0%B1%D0%B0%D0%BC%D0%B0,_%D0%91%D0%B0%D1%80%D0%B0%D0%BA',
					title: 'Обама, Барак',
					langname: 'русский'
				}, {
					lang: 'uz',
					url: 'https://uz.wikipedia.org/wiki/Barak_Obama',
					title: 'Barak Obama',
					langname: 'oʻzbekcha/ўзбекча'
				}, {
					lang: 'zh',
					url: 'https://zh.wikipedia.org/wiki/%E8%B4%9D%E6%8B%89%E5%85%8B%C2%B7%E5%A5%A5%E5%B7%B4%E9%A9%AC',
					title: '贝拉克·奥巴马',
					langname: '中文'
				}, {
					lang: 'zh-min-nan',
					url: 'https://zh-min-nan.wikipedia.org/wiki/Barack_Obama',
					title: 'Barack Obama',
					langname: 'Bân-lâm-gú'
				}, {
					lang: 'zh-yue',
					url: 'https://zh-yue.wikipedia.org/wiki/%E5%A5%A7%E5%B7%B4%E9%A6%AC',
					title: '奧巴馬',
					langname: '粵語'
				}, {
					lang: 'zu',
					url: 'https://zu.wikipedia.org/wiki/Barack_Obama',
					title: 'Barack Obama',
					langname: 'isiZulu'
				}
			];

			this.deviceLanguage = 'en-us';

			this.frequentlyUsedLanguages = {
				zh: 2,
				ko: 1
			};

			this.structuredLanguages = {
				all: [
					{
						lang: 'ar',
						langname: 'العربية',
						title: 'باراك أوباما',
						url: 'https://ar.wikipedia.org/wiki/%D8%A8%D8%A7%D8%B1%D8%A7%D9%83_%D8%A3%D9%88%D8%A8%D8%A7%D9%85%D8%A7'
					},
					{
						lang: 'be',
						langname: 'беларуская',
						title: 'Барак Абама',
						url: 'https://be.wikipedia.org/wiki/%D0%91%D0%B0%D1%80%D0%B0%D0%BA_%D0%90%D0%B1%D0%B0%D0%BC%D0%B0'
					},
					{
						lang: 'be-x-old',
						langname: 'беларуская (тарашкевіца)',
						title: 'Барак Абама',
						url: 'https://be-x-old.wikipedia.org/wiki/%D0%91%D0%B0%D1%80%D0%B0%D0%BA_%D0%90%D0%B1%D0%B0%D0%BC%D0%B0'
					},
					{
						lang: 'es',
						langname: 'Spanish',
						title: 'Barack Obama',
						url: 'https://en.wikipedia.org/wiki/Barack_Obama'
					},
					{
						lang: 'ru',
						langname: 'русский',
						title: 'Обама, Барак',
						url: 'https://ru.wikipedia.org/wiki/%D0%9E%D0%B1%D0%B0%D0%BC%D0%B0,_%D0%91%D0%B0%D1%80%D0%B0%D0%BA'
					},
					{
						lang: 'uz',
						langname: 'oʻzbekcha/ўзбекча',
						title: 'Barak Obama',
						url: 'https://uz.wikipedia.org/wiki/Barak_Obama'
					},
					{
						lang: 'zh-min-nan',
						langname: 'Bân-lâm-gú',
						title: 'Barack Obama',
						url: 'https://zh-min-nan.wikipedia.org/wiki/Barack_Obama'
					},
					{
						lang: 'zh-yue',
						langname: '粵語',
						title: '奧巴馬',
						url: 'https://zh-yue.wikipedia.org/wiki/%E5%A5%A7%E5%B7%B4%E9%A6%AC'
					},
					{
						lang: 'zu',
						langname: 'isiZulu',
						title: 'Barack Obama',
						url: 'https://zu.wikipedia.org/wiki/Barack_Obama'
					}
				],
				preferred: [
					{
						frequency: 2,
						lang: 'zh',
						langname: '中文',
						title: '贝拉克·奥巴马',
						url: 'https://zh.wikipedia.org/wiki/%E8%B4%9D%E6%8B%89%E5%85%8B%C2%B7%E5%A5%A5%E5%B7%B4%E9%A9%AC'
					},
					{
						frequency: 1,
						lang: 'ko',
						langname: '한국어',
						title: '버락 오바마',
						url: 'https://ko.wikipedia.org/wiki/%EB%B2%84%EB%9D%BD_%EC%98%A4%EB%B0%94%EB%A7%88'
					}
				]
			};

			this.sandbox.stub( mw.storage, 'get' ).withArgs( 'langMap' )
				.returns( JSON.stringify( this.frequentlyUsedLanguages ) );
			this.saveSpy = this.sandbox.stub( util, 'saveFrequentlyUsedLanguages' );
		}
	} );

	QUnit.test( 'test utility functions', 4, function ( assert ) {
		assert.deepEqual( util.getFrequentlyUsedLanguages(), this.frequentlyUsedLanguages,
			'Frequently used languages is correct.' );

		util.saveLanguageUsageCount( 'ko', util.getFrequentlyUsedLanguages() );
		assert.ok( this.saveSpy.calledWith( {
			zh: 2,
			ko: 2
		} ), 'Frequently used language is correctly saved.' );

		assert.deepEqual(
			util.getStructuredLanguages( this.apiLanguages, this.frequentlyUsedLanguages, this.deviceLanguage ),
			this.structuredLanguages,
			'Structured languages are correct.'
		);

		// device language is a variant and only the parent language is available
		assert.equal(
			util.getStructuredLanguages( this.apiLanguages, {}, 'es-lx' ).preferred[0].lang,
			'es',
			'"es" is correctly selected as a preferred language even though the device language is "es-lx".'
		);
	} );

} )( mw.mobileFrontend );
