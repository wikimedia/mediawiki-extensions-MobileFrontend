( function ( M ) {

	var CONTROL_BUCKET = 'control',
		user = M.require( 'user' ),
		MAX_INT32_UNSIGNED = 4294967295;

	/**
	 * An implementation of Jenkins's one-at-a-time hash
	 * See <http://en.wikipedia.org/wiki/Jenkins_hash_function>
	 *
	 * @param {String} key String to hash.
	 * @return {Number} 32-bit integer.
	 * @ignore
	 *
	 * @author Ori Livneh <ori@wikimedia.org>
	 * @see http://jsbin.com/kejewi/4/watch?js,console
	 */
	function hashString( key ) {
		var hash = 0,
			i = key.length;

		while ( i-- ) {
			hash += key.charCodeAt( i );
			hash += ( hash << 10 );
			hash ^= ( hash >> 6 );
		}
		hash += ( hash << 3 );
		hash ^= ( hash >> 11 );
		hash += ( hash << 15 );

		return hash;
	}

	/**
	 * Gets the bucket for the experiment given the token.
	 *
	 * The name of the experiment and the user's token are hashed. The hash is converted to a number
	 * which is then used to assign the user to a bucket.
	 *
	 * Consider the following experiment configuration:
	 *
	 * ```
	 * {
	 *   enabled: true,
	 *   buckets: {
	 *     control: 0.5
	 *     A: 0.25,
	 *     B: 0.25
	 *   }
	 * }
	 * ```
	 *
	 * The experiment has three buckets: control, A, and B. The user has a 50% chance of being
	 * assigned to the control bucket, and a 25% chance of being assigned to either the A or B
	 * buckets. If the experiment were disabled, then the user would always be assigned to the
	 * control bucket.
	 *
	 * This function is based on the deprecated `mw.user.bucket` function.
	 *
	 * @ignore
	 * @param {Object} experiments A map of experiment name to experiment definition
	 * @param {String} experiment
	 * @param {String} token
	 * @throws Error If the experiment hasn't been defined
	 * @returns {String}
	 */
	function getBucketInternal( experiments, experiment, token ) {
		var options,
			buckets,
			key,
			range = 0,
			hash,
			max,
			acc = 0;

		if ( !experiments.hasOwnProperty( experiment ) ) {
			throw new Error( 'The experiment "' + experiment + '" hasn\'t been defined.' );
		}

		options = experiments[experiment];

		if ( !options.enabled ) {
			return CONTROL_BUCKET;
		}

		buckets = options.buckets;

		for ( key in buckets ) {
			range += buckets[key];
		}

		hash = hashString( experiment + ':' + token );
		max = ( Math.abs( hash ) / MAX_INT32_UNSIGNED ) * range;

		for ( key in buckets ) {
			acc += buckets[key];

			if ( max <= acc ) {
				return key;
			}
		}
	}

	/**
	 * @class mw.mobileFrontend.experiments
	 * @singleton
	 */
	M.define( 'experiments', {

		/**
		 * Gets the bucket for the experiment.
		 *
		 * If the experiment is disabled or if the browser doesn't support local storage, then the
		 * user is always assigned to the "control" bucket.
		 *
		 * Defers to `user.getSessionId` to generate and persist the token.
		 *
		 * @param {String} experiment
		 * @throws Error If the experiment hasn't been defined in the `$wgMFExperiments`
		 *  configuration variable
		 * @returns {String}
		 */
		getBucket: function ( experiment ) {
			var experiments = mw.config.get( 'wgMFExperiments' ) || {},
				token = user.getSessionId();

			// The browser doesn't support local storage? See `browser.supportsLocalStorage`.
			if ( token === '' ) {
				return CONTROL_BUCKET;
			}

			return getBucketInternal( experiments, experiment, token );
		}
	} );

}( mw.mobileFrontend ) );
