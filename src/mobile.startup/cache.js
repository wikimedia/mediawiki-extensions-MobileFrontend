/* This module defines several types of cache classes to use in other
 * modules.
 * The interface, that all types use, is kept synchronous driven by current
 * usage patterns, but will need to be revisited in case usage patterns
 * suggest we need asynchronous caches.
 */

/**
 * In memory cache implementation
 *
 * @class MemoryCache
 * @private
 */
class MemoryCache {
	constructor() {
		this._cache = {};
	}

	/**
	 * Retrieve a cached value from a key
	 *
	 * @param {string} key
	 * @return {any}
	 */
	get( key ) {
		return this._cache[ key ];
	}

	/**
	 * Cache a value by key
	 *
	 * @param {string} key
	 * @param {any} value
	 */
	set( key, value ) {
		this._cache[ key ] = value;
	}
}

/**
 * Null object cache implementation
 */
class NoCache {
	constructor() { }

	/**
	 * NoOp
	 */
	get() { }

	/**
	 * NoOp
	 */
	set() { }
}

module.exports = {
	MemoryCache,
	NoCache
};
