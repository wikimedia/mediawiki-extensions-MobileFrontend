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
	 * Assigns a user to a bucket.
	 *
	 * The name of the experiment and the user's token are hashed. The hash is converted to a number
	 * which is then used to assign the user to a bucket.
	 *
	 * Based on the `mw.user.bucket` function.
	 *
	 * @param {String} experiment
	 * @param {Object} buckets A map of bucket name to weight, e.g.
	 *  <code>
	 *  {
	 *      "control": 0.5,
	 *      "A": 0.25,
	 *      "B": 0.25
	 *  }
	 *  </code>
	 * @param {String} token
	 * @return {String}
	 */
	function bucket( experiment, buckets, token ) {
		var key,
			range = 0,
			hash,
			max,
			acc = 0;

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
				options,
				token;

			if ( !experiments.hasOwnProperty( experiment ) ) {
				throw new Error( 'The experiment "' + experiment + '" hasn\'t been defined.' );
			}

			options = experiments[experiment];

			if ( !options.enabled ) {
				return CONTROL_BUCKET;
			}

			token = user.getSessionId();

			// The browser doesn't support local storage? See `browser.supportsLocalStorage`.
			if ( token === '' ) {
				return CONTROL_BUCKET;
			}

			return bucket( experiment, options.buckets, token );
		}
	} );

} ( mw.mobileFrontend ) );
