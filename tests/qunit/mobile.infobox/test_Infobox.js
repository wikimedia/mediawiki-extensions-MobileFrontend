( function ( M ) {
	var Infobox = M.require( 'modules/Infobox' );

	QUnit.module( 'Infobox', {
		setup: function () {
		},
		teardown: function () {
		}
	} );

	QUnit.test( 'Check time format', 2, function ( assert ) {
		assert.strictEqual( Infobox.prototype._getFormattedTime( {
				time: '-00000000550-01-01T00:00:00Z',
				timezone: 0,
				before: 0,
				after: 0,
				precision: 9,
				calendarmodel: 'http://www.wikidata.org/entity/Q1985727'
			} ), '550 BCE', 'Darius I of Persia\'s DOB is correctly formatted.' );

		assert.strictEqual( Infobox.prototype._getFormattedTime( {
				time: '+00000001879-03-14T00:00:00Z',
				timezone: 0,
				before: 0,
				after: 0,
				precision: 11,
				calendarmodel: 'http://www.wikidata.org/entity/Q1985727'
			} ), 'March 14 1879', 'Albert Einstein\'s DOB is correctly formatted.' );
	} );
}( mw.mobileFrontend ) );
