// Node 21+ defines `globalThis.navigator` as a getter-only accessor, so
// mw-node-qunit@7.2.0's `global.navigator = window.navigator` throws. Replace
// the accessor with a writable data property before the upstream setUp runs.
// Remove once mw-node-qunit ships the fix from wikimedia/mw-node-qunit#42.
const navDesc = Object.getOwnPropertyDescriptor( globalThis, 'navigator' );
if ( navDesc && navDesc.get && !navDesc.set ) {
	Object.defineProperty( globalThis, 'navigator', {
		value: undefined,
		writable: true,
		configurable: true
	} );
}

module.exports = require( '@wikimedia/mw-node-qunit' ).dom;
