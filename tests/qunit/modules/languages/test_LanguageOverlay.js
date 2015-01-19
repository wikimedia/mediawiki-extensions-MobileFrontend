( function ( LanguageOverlay ) {
	QUnit.module( 'MobileFrontend: LanguageOverlay' );

	QUnit.test( 'filterLanguages', 1, function ( assert ) {
		var overlay = new LanguageOverlay( {
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
		overlay.filterLists( 'Port' );
		assert.strictEqual( overlay.$( 'ul li:visible' ).length, 1, 'Only one of the results should be visible.' );
		overlay.hide();
	} );
} )( mw.mobileFrontend.require( 'modules/languages/LanguageOverlay' ) );
