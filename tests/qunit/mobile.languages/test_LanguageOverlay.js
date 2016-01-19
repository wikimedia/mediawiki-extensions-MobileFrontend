( function ( M, LanguageOverlay ) {
	var settings = M.require( 'mobile.settings/settings' ),
		schemaMobileWebLanguageSwitcher = M.require(
			'mobile.loggingSchemas/schemaMobileWebLanguageSwitcher' );

	QUnit.module( 'MobileFrontend: LanguageOverlay', {
		setup: function () {
			this.sandbox.stub( settings, 'get' ).withArgs( 'langMap' )
				.returns( '{}' );
			if ( mw.eventLog ) {
				this.sandbox.stub( mw.eventLog.Schema.prototype, 'log' );
			}
		}
	} );

	QUnit.test( 'filterLanguages', 2, function ( assert ) {
		var overlay = new LanguageOverlay( {
			languageSwitcherSchema: schemaMobileWebLanguageSwitcher,
			languages: [
				{
					lang: 'en',
					langname: 'English',
					title: 'The dog',
					url: 'wiki/Dog'
				},
				{
					lang: 'fr',
					langname: 'French',
					title: 'Le chien',
					url: 'wiki/chien'
				},
				{
					lang: 'pt',
					langname: 'Portuguese',
					title: 'O cachorro',
					url: 'wiki/cachorro'
				}
			]
		} );
		// Needed so we can make use of :visible
		overlay.show();
		overlay.filterLists( 'port' );
		assert.ok( overlay.$( '.site-link-list li' ).eq( 1 ).css( 'display' ) === 'none', 'French should be hidden.' );
		assert.ok( overlay.$( '.site-link-list li' ).eq( 2 ).css( 'display' ) !== 'none', 'Portuguese should be visible.' );
		overlay.hide();
	} );

	QUnit.test( 'Preferred Languages', 3, function ( assert ) {
		var overlay = new LanguageOverlay( {
				languageSwitcherSchema: schemaMobileWebLanguageSwitcher,
				languages: [],
				currentLanguage: 'en'
			} );
		overlay.trackLanguage( 'de' );
		overlay.trackLanguage( 'fr' );
		overlay.trackLanguage( 'fr' );
		assert.strictEqual( overlay.languageMap.en, 1, 'Current language automatically tracked.' );
		assert.strictEqual( overlay.languageMap.de, 1, 'Saved click on language link' );
		assert.strictEqual( overlay.languageMap.fr, 2, 'Saved click on language link' );
	} );

	QUnit.module( 'MobileFrontend: LanguageOverlay##_sortLanguages', {
		setup: function () {
			this.sandbox.stub( settings, 'get' ).withArgs( 'langMap' )
				.returns( '{ "es": 3, "za": 100, "fr": 50 }' );
			if ( mw.eventLog ) {
				this.sandbox.stub( mw.eventLog.Schema.prototype, 'log' );
			}
		}
	} );

	QUnit.test( 'Languages get sorted by order', 2, function ( assert ) {
		var languages,
			overlay = new LanguageOverlay( {
				languageSwitcherSchema: schemaMobileWebLanguageSwitcher,
				languages: [
					{
						lang: 'es'
					},
					{
						lang: 'za'
					},
					{
						lang: 'fr'
					}
				]
			} );
		languages = overlay.options.languages;
		assert.strictEqual( languages[0].lang, 'za', 'Language with highest score appears at top' );
		assert.strictEqual( languages[2].lang, 'es', 'Language with lowest score at bottom' );
	} );

	QUnit.test( 'Languages get sorted by order (different scripts)', 7, function ( assert ) {
		var languages,
			overlay = new LanguageOverlay( {
				languageSwitcherSchema: schemaMobileWebLanguageSwitcher,
				languages: [
					{
						langname: 'French',
						lang: 'fr'
					},
					{
						langname: 'العربية',
						lang: 'ar'
					},
					{
						langname: 'oʻzbekcha/ўзбекча',
						lang: 'uz'
					},
					{
						langname: 'English',
						lang: 'en'
					},
					{
						langname: 'Deutsch',
						lang: 'de'
					},
					{
						langname: '한국어',
						lang: 'ko'
					},
					{
						langname: 'русский',
						lang: 'ru'
					}
				]
			} );
		languages = overlay.options.languages;
		assert.strictEqual( languages[0].lang, 'fr', 'Language with highest score appears at top' );
		assert.strictEqual( languages[1].lang, 'de', 'Alphabetical order #1' );
		assert.strictEqual( languages[2].lang, 'en', 'Alphabetical order #2' );
		assert.strictEqual( languages[3].lang, 'uz', 'Alphabetical order #3' );
		assert.strictEqual( languages[4].lang, 'ru', 'Alphabetical order #4' );
		assert.strictEqual( languages[5].lang, 'ar', 'Alphabetical order #5' );
		assert.strictEqual( languages[6].lang, 'ko', 'Alphabetical order #6' );
	} );

} )( mw.mobileFrontend, mw.mobileFrontend.require( 'mobile.overlays/LanguageOverlay' ) );
