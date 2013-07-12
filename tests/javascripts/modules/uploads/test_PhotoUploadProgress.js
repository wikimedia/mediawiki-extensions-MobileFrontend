( function ( $, M ) {

	var PhotoUploadProgress = M.require( 'modules/uploads/PhotoUploadProgress' );

	QUnit.module( 'MobileFrontend PhotoUploadProgress', {
		setup: function() {
			this.clock = sinon.useFakeTimers();
		},
		teardown: function() {
			this.clock.restore();
		}
	} );

	QUnit.test( 'PhotoUploadProgress', 3, function() {
		var progressPopup = new PhotoUploadProgress();
		ok(
			progressPopup.$( '.wait' ).text().match( /wait/ ),
			'set initial wait message'
		);
		this.clock.tick( 11000 );
		ok(
			progressPopup.$( '.wait' ).text().match( /still/ ),
			'set secondary wait message'
		);
		this.clock.tick( 11000 );
		ok(
			progressPopup.$( '.wait' ).text().match( /wait/ ),
			'set initial wait message again'
		);
	} );

}( jQuery, mw.mobileFrontend) );
