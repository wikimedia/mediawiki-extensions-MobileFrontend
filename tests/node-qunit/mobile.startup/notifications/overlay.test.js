/* eslint-disable one-var */

const dom = require( '../../utils/dom' );
const jQuery = require( '../../utils/jQuery' );
const sinon = require( 'sinon' );
const mediawiki = require( '../../utils/mw' );
const mustache = require( '../../utils/mustache' );
const oo = require( '../../utils/oo' );

let NotificationsOverlay;
let Overlay;
let View;

/** @type {sinon.SinonSandbox} */ let sandbox;

QUnit.module( 'mobile.startup/notifications/overlay.js', {
	beforeEach: () => {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediawiki.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		NotificationsOverlay = require( '../../../../src/mobile.startup/notifications/overlay.js' );
		Overlay = require( '../../../../src/mobile.startup/Overlay.js' );
		View = require( '../../../../src/mobile.startup/View.js' );
	},
	afterEach: () => {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'onBeforeExit(no transitions)', ( assert ) => {
	const overlay = Overlay.make( {}, View.make() );
	Object.setPrototypeOf( overlay.$el[0].style, {} );
	const spy = sinon.spy();
	NotificationsOverlay.test.onBeforeExit( overlay, spy );
	sinon.assert.calledOnce( spy );
	assert.ok( true );
} );

QUnit.test( 'onBeforeExit(transitions)', ( assert ) => {
	const overlay = Overlay.make( {}, View.make() );
	const spy = sinon.spy();
	NotificationsOverlay.test.onBeforeExit( overlay, spy );
	sinon.assert.notCalled( spy );
	assert.ok( true );
} );
