var cache = require( '../../../src/mobile.startup/cache' ),
	MemoryCache = cache.MemoryCache,
	memoryCache = new MemoryCache();

QUnit.module( 'MobileFrontend cache.js' );

QUnit.test( 'cache set() and get()', function ( assert ) {
	memoryCache.set( 'key', 'value' );
	assert.strictEqual( memoryCache.get( 'key' ), 'value' );
} );
