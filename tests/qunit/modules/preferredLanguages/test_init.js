( function ( $, M ) {

	var settings = M.require( 'settings' ),
		oldLangMap = settings.get( 'langMap' );

	QUnit.module( 'MobileFrontend modules/mf-translator', {
		setup: function () {
			// save old value of langMap
			oldLangMap = settings.get( 'langMap' );
			// destroy actual value
			settings.save( 'langMap', JSON.stringify( {} ) );
		},
		teardown: function () {
			// restore old langMap
			settings.save( 'langMap', oldLangMap );
		}
	} );

	QUnit.test( 'Check click on a language link', 1, function ( assert ) {
		var langMap;

		// fake click on german language link (de)
		M.emit( 'language-select', 'de' );
		// check, if the click was saved
		langMap = JSON.parse( settings.get( 'langMap' ) );
		assert.strictEqual( langMap.de, 1, 'Saved click on \'de\' language link' );
	} );

}( jQuery, mw.mobileFrontend ) );
