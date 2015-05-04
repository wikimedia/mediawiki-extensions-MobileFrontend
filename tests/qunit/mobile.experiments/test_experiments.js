( function ( mw, M ) {

	var user = M.require( 'user' );

	QUnit.module( 'MobileFrontend Experiments', {
		setup: function () {
			this.wgMFExperiments = {
				foo: {
					enabled: true,
					buckets: {
						control: 50,
						'wikigrok-version-a': 25,
						'wikigrok-version-b': 25
					}
				},
				bar: {
					enabled: false,
					buckets: {
						control: 84,
						'should-see-wikigrok-roulette': 16
					}
				}
			};
			mw.config.set( 'wgMFExperiments', this.wgMFExperiments );

			this.stub( user, 'getSessionId' ).returns( 'session-id' );

			this.experiments = M.require( 'experiments' );
		}
	} );

	QUnit.test( 'it should throw when the experiment hasn\'t been defined', 1, function ( assert ) {
		assert.throws( function () {
			this.experiments.getBucket( 'baz' );
		} );
	} );

	QUnit.test( 'it should always return "control" if the experiment has been defined as disabled', 2, function ( assert ) {
		var bucket = this.experiments.getBucket( 'bar' );

		assert.strictEqual( 'control', bucket );
		assert.strictEqual( false, user.getSessionId.called );
	} );

	QUnit.test( 'it should always assign the user to the same bucket given the same token', 1, function ( assert ) {
		assert.strictEqual(
			this.experiments.getBucket( 'foo' ),
			this.experiments.getBucket( 'foo' )
		);
	} );

	QUnit.test( 'it should always return "control" if the browser doesn\'t support local storage', 1, function ( assert ) {
		user.getSessionId.returns( '' );

		assert.strictEqual( 'control', this.experiments.getBucket( 'foo' ) );
	} );

} ( mw, mw.mobileFrontend ) );
