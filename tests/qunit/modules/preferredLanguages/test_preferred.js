( function ( $, M ) {

	var oldLangMap = M.settings.getUserSetting( 'langMap' );

	QUnit.module( 'MobileFrontend modules/mf-translator', {
		setup: function() {
			// save old value of langMap
			oldLangMap = M.settings.getUserSetting( 'langMap' );
			// destroy actual value
			M.settings.saveUserSetting( 'langMap', JSON.stringify( {} ) );
		},
		teardown: function() {
			// restore old langMap
			M.settings.saveUserSetting( 'langMap', oldLangMap );
		}
	} );

	QUnit.test( 'Check click on a language link', 1, function( assert ) {
		var langMap;

		// fake click on german language link (de)
		M.emit( 'language-select', 'de' );
		// check, if the click was saved
		langMap = JSON.parse( M.settings.getUserSetting( 'langMap' ) );
		assert.strictEqual( langMap.de, 1, "Saved click on 'de' language link" );
	} );

}( jQuery, mw.mobileFrontend ) );
