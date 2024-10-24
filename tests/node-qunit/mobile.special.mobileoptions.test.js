/* global $ */
const
	jQuery = require( './utils/jQuery' ),
	dom = require( './utils/dom' ),
	mediaWiki = require( './utils/mw' ),
	oo = require( './utils/oo' ),
	sinon = require( 'sinon' );
let mobileoptions, sandbox;
QUnit.module( 'mobile.special.mobileoptions.scripts', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mw.requestIdleCallback = ( callback ) => callback();
		mw.message = () => ( {
			text: () => 'msg',
			exists: () => true
		} );
		class MockApi {
			saveOptions() {
				return Promise.resolve();
			}
		}
		mw.Api = MockApi;
		mw.user.clientPrefs = {
			get: () => 1,
			set: () => {
				const classList = document.documentElement.classList;
				classList.remove( 'favenum-clientpref-2' );
				classList.add( 'favenum-clientpref-1' );
			}
		};
		mw.util.addPortlet = ( id ) => {
			const p = document.createElement( 'ul' );
			p.id = id;
			document.body.appendChild( p );
			return p;
		};
		mw.util.addPortletLink = ( id ) => {
			const l = document.createElement( 'li' );
			const a = document.createElement( 'a' );
			const p = document.getElementById( id );
			l.appendChild( a );
			p.appendChild( l );
			return l;
		};
		mw.util.debounce = ( callback ) => () => callback();
		mobileoptions = require( '../../src/mobile.special.mobileoptions.scripts.js' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'addClientPreferencesToForm (named user)', ( assert ) => new Promise( ( resolve ) => {
	mw.user.isNamed = () => true;
	const callback = () => {
		assert.strictEqual( document.documentElement.classList.contains( 'favenum-clientpref-2' ), false, 'was toggled off' );
		resolve();
	};
		// Must be in the DOM and have an ID for this to work.
	const $form = $( '<form id="testcaseClientprefs">' ).appendTo( document.body );
	document.documentElement.classList.add( 'favenum-clientpref-2' );
	mobileoptions.test.addClientPreferencesToForm( $form, {
		favenum: {
			callback,
			options: [ 1, 2, 3 ],
			preferenceKey: 'favoriteNumber'
		}
	} ).then( ( cp ) => {
		cp.querySelector( 'input' ).dispatchEvent( new Event( 'change' ) );
	} );
} ) );
